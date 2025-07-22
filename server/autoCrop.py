from collections import defaultdict
import cv2
import imageio
import pickle
import argparse
import ffmpeg
import tempfile
import numpy as np
from deep_sort_realtime.deepsort_tracker import DeepSort
from ultralytics import YOLO
import os
import glob

os.environ['PYTORCH_ENABLE_MPS_FALLBACK'] = '1'
os.environ['NPY_USE_BLAS_ILP64'] = '0'
os.environ['VECLIB_MAXIMUM_THREADS'] = '1'
os.environ['PYTORCH_MPS_HIGH_WATERMARK_RATIO'] = '0.0'

GREEN = (0, 255, 0)
WHITE = (255, 255, 255)


def detect_people(frame, model):
    detections = model(frame, device="mps", half=True)[0]
    for data in detections.boxes.data.tolist():
        confidence = data[4]
        class_id = data[5]
        if confidence >= 0.5 and class_id == 0:
            xmin, ymin, xmax, ymax = int(data[0]), int(
                data[1]), int(data[2]), int(data[3])
            yield [[xmin, ymin, xmax - xmin, ymax - ymin], confidence, class_id]

def bbox_center(bbox):
    return (int((bbox[0] + bbox[2]) // 2), int((bbox[1] + bbox[3]) // 2))

def filter_top_percent_tracks(track_durations, top_percent):
    num_tracks_to_keep = int(len(track_durations) * top_percent)
    sorted_tracks = sorted(track_durations.items(),
                           key=lambda item: item[1], reverse=True)
    top_tracks = sorted_tracks[:num_tracks_to_keep]
    filtered_track_durations = {
        track_id: duration for track_id, duration in top_tracks}
    return filtered_track_durations

def find_subjects(frames, track_durations):
    subjects = []
    if len(track_durations) > 100:
        track_durations = filter_top_percent_tracks(track_durations, 0.2)

    for frame in frames:
        longest_duration = 0
        subject_center = None
        if len(frame) <= 8:
            for track in frame:
                track_id = track['track_id']
                duration = track_durations.get(track_id, 0)

                if duration > longest_duration:
                    longest_duration = duration
                    subject_center = bbox_center(
                        track['bbox'])

        subjects.append(subject_center)

    return subjects

def track(video_path, subjects_fn, preview):
    cap = cv2.VideoCapture(video_path)
    detector = YOLO("yolo11s.pt")
    tracker = DeepSort(max_age=10, embedder='mobilenet',
                       embedder_gpu=True)

    cap = cv2.VideoCapture(video_path)

    frame_count = 0
    detections = []
    tracks = []

    track_durations = defaultdict(int)
    tracks_per_frame = []
    subjects = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        if frame_count % 3 == 0:
            detections = list(detect_people(frame, detector))
            tracks = tracker.update_tracks(detections, frame=frame)

        tracks_per_frame.append([])

        for track in tracks:
            if not track.is_confirmed():
                continue

            track_durations[track.track_id] = track.age
            tracks_per_frame[-1].append({
                'track_id': track.track_id,
                'bbox': track.to_ltrb(),
            })

            track_id = track.track_id
            ltrb = track.to_ltrb()
            xmin, ymin, xmax, ymax = int(ltrb[0]), int(
                ltrb[1]), int(ltrb[2]), int(ltrb[3])
            cv2.rectangle(frame, (xmin, ymin), (xmax, ymax), GREEN, 2)
            cv2.rectangle(frame, (xmin, ymin - 20),
                          (xmin + 20, ymin), GREEN, -1)
            cv2.putText(frame, str(track_id), (xmin + 5, ymin - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, WHITE, 2)

        if preview:
            cv2.imshow('Processed Frame', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    subjects = find_subjects(
        tracks_per_frame, track_durations)
    pickle.dump(subjects, open(subjects_fn, 'wb'))

    cap.release()
    cv2.destroyAllWindows()

def ease_camera_towards_subject(current_pos, target_pos, damping_factor):
    distance_vector = np.array(target_pos) - np.array(current_pos)
    eased_vector = distance_vector * damping_factor
    new_pos = np.array(current_pos) + eased_vector
    return tuple(new_pos.astype(int))

def center_subject_in_frame(frame, new_size, subject_position, last_position, damping_factor):
    original_height, original_width = frame.shape[:2]
    new_width, new_height = new_size

    subject_center_x, subject_center_y = subject_position
    desired_x = max(0, min(original_width - new_width,
                    subject_center_x - new_width // 2))
    desired_y = max(0, min(original_height - new_height,
                    subject_center_y - new_height // 2))

    new_x, new_y = ease_camera_towards_subject(
        last_position, (desired_x, desired_y), damping_factor)

    new_x = max(0, min(new_x, original_width - new_width))
    new_y = max(0, min(new_y, original_height - new_height))

    cropped_frame = frame[new_y:new_y + new_height, new_x:new_x + new_width]

    return cropped_frame, (new_x, new_y), (new_x, new_y, new_width, new_height)

def round_to_multiple(number, multiple):
    return round(number / multiple) * multiple

def reframe(video_path, subjects_fn, preview):
    target_aspect_ratio = (9, 16)
    cap = cv2.VideoCapture(video_path)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    original_fourcc = int(cap.get(cv2.CAP_PROP_FOURCC))

    # Maintain original resolution when possible
    base_dimension = min(width, height)

    target_aspect_ratio_width, target_aspect_ratio_height = target_aspect_ratio
    if width < height:
        new_width = int(base_dimension)
        new_height = int(
            base_dimension * target_aspect_ratio_height / target_aspect_ratio_width)
    else:
        new_height = int(base_dimension)
        new_width = int(base_dimension *
                        target_aspect_ratio_width / target_aspect_ratio_height)

    new_width = int(min(round_to_multiple(new_width, 16), width))
    new_height = int(min(round_to_multiple(new_height, 16), height))

    frame_center = (int(width // 2), int(height // 2))

    with tempfile.NamedTemporaryFile(suffix='.mp3') as temp_audio, \
            tempfile.NamedTemporaryFile(suffix='.mp4') as temp_video:

        # Use higher quality settings for imageio writer
        writer = imageio.get_writer(
            temp_video.name, 
            fps=fps, 
            format='mp4', 
            codec='h264_videotoolbox', 
            quality=10,
            bitrate='20M',
            pixelformat='yuv420p',
            output_params=[
                '-profile:v', 'high',
                '-movflags', '+faststart',
                '-color_range', '1',
                '-pix_fmt', 'yuv420p',
                '-vsync', '0'
            ]
        )

        subjects = pickle.load(open(subjects_fn, 'rb'))

        frame_count = 0
        last_crop_position = (0, 0)
        last_subject_position = (int(width // 2), int(height // 2))
        lost_subject_for = 0

        while cap.isOpened():
            ret, frame = cap.read()

            if not ret:
                break

            if not subjects[frame_count]:
                subject = last_subject_position
                lost_subject_for += 1
            else:
                subject = subjects[frame_count]
                last_subject_position = subject
                lost_subject_for = 0

            LOST_SUBJECT_THRESHOLD_SEC = 3
            if lost_subject_for > LOST_SUBJECT_THRESHOLD_SEC * fps:
                subject = frame_center

            cropped_frame, last_crop_position, crop_bbox = center_subject_in_frame(
                frame, (new_width, new_height), subject, last_crop_position, 0.1
            )

            writer.append_data(cv2.cvtColor(cropped_frame, cv2.COLOR_BGR2RGB))

            cv2.rectangle(frame, (int(subject[0]) - 5, int(subject[1]) - 5),
                          (int(subject[0]) + 5, int(subject[1]) + 5), GREEN, 2)
            cv2.rectangle(frame, (crop_bbox[0], crop_bbox[1]), (crop_bbox[0] + crop_bbox[2],
                                                                crop_bbox[1] + crop_bbox[3]), GREEN, 2)

            if lost_subject_for > 0:
                cv2.putText(frame, f"Lost subject for {lost_subject_for / fps} seconds",
                            (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, WHITE, 2)

            if preview:
                cv2.imshow('Processed Frame', frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

            frame_count += 1

        cap.release()
        writer.close()

        # Extract audio with highest quality settings
        ffmpeg.input(video_path).output(temp_audio.name,
                                        q=0, map='a').run(overwrite_output=True)

        input_video_stream = ffmpeg.input(temp_video.name)
        input_audio_stream = ffmpeg.input(temp_audio.name)
        
        # Create output directory if it doesn't exist
        output_dir = os.path.join("reframe")
        os.makedirs(output_dir, exist_ok=True)
        
        # Create output filename
        base_name = os.path.basename(video_path)
        output_path = os.path.join(output_dir, f"{os.path.splitext(base_name)[0]}_reframed.mp4")
        
        # Use highest quality encoding settings
        # ffmpeg.output(input_video_stream, input_audio_stream, f"{video_path.split('.')[0]}_reframed.mp4",
        #               codec='hevc_videotoolbox', vcodec='libx264', pix_fmt='yuv420p', vf='format=yuv420p', profile='main', level='4.0').run(overwrite_output=True)
        ffmpeg.output(
            input_video_stream,
            input_audio_stream,
            output_path,
            vcodec='hevc_videotoolbox',
            acodec='aac',
            pix_fmt='yuv420p',
            quality='high'
        ).run(overwrite_output=True)

def process_video(video_path, preview=False):
    """Process a single video through both tracking and reframing"""
    print(f"\nProcessing {video_path}...")
    
    # Step 1: Tracking
    subjects_fn = f'{os.path.splitext(video_path)[0]}_subjects.pickle'
    print("Running tracking...")
    track(video_path, subjects_fn, preview)
    
    # Step 2: Reframing
    print("Running reframing...")
    reframe(video_path, subjects_fn, preview)
    
    # Clean up temporary file
    if os.path.exists(subjects_fn):
        os.remove(subjects_fn)
    print(f"Completed processing {video_path}")


def process_all_videos(preview=False):
    """Process all videos in the DeadCut folder"""
    input_folder = "DeadCut"
    
    if not os.path.exists(input_folder):
        print(f"Error: Input folder '{input_folder}' does not exist")
        return
    
    video_files = glob.glob(os.path.join(input_folder, "*.mp4"))
    
    if not video_files:
        print(f"No MP4 files found in {input_folder}")
        return
    
    for video_path in video_files:
        process_video(video_path, preview)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automatically track and reframe videos.")
    parser.add_argument('--preview', dest='preview', action='store_true',
                       help='Display processing preview windows', default=False)
    args = parser.parse_args()
    
    process_all_videos(args.preview)
