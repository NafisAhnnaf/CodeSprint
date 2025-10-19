import Request from "../composables/Request";

const ping = async () => {
  try {
    const res = await Request.get("/");
    if (res.status === 200) {
      console.log("Ping successful");
    }
  } catch (error) {
    console.log("Failed to ping the server.", error);
  }
};

export default ping;
