import Request from "../composables/Request"; // adjust relative path accordingly

// Fetch all whiteboards
export const fetchAllWhiteboards = async () => {
  try {
    const response = await Request.get("/api/whiteboard");
    return response; // Return the data to the caller
  } catch (error) {
    console.error("Error fetching all whiteboards:", error);
    throw error;
  }
};

// Fetch a whiteboard by ID
export const fetchWhiteboardById = async (id) => {
  try {
    const response = await Request.get(`/api/whiteboard/${id}`);
    return response;
  } catch (error) {
    console.error(`Error fetching whiteboard with id ${id}:`, error);
    throw error;
  }
};

// Create a new whiteboard
// whiteboardData is an object containing the info to create a whiteboard
export const saveWhiteboard = async (whiteboardData) => {
  try {
    const response = await Request.post("/api/whiteboard", whiteboardData);
    return response;
  } catch (error) {
    console.error("Error creating whiteboard:", error);
    throw error;
  }
};
