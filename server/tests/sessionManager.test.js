const sessionManager = require("../utils/sessionManager");
const childProcess = require("child_process");

jest.mock("child_process");

describe("sessionManager", () => {
  beforeEach(() => {
    childProcess.spawn.mockClear();
  });

  test("startSession spawns aiAgent and whiteboard processes", () => {
    childProcess.spawn.mockReturnValue({
      stdin: { write: jest.fn(), end: jest.fn() },
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      kill: jest.fn(),
    });

    sessionManager.startSession("sess1", { userId: "user1" });
    expect(childProcess.spawn).toHaveBeenCalledTimes(2); // aiAgent + whiteboard
  });

  // More tests can be added for other functions similarly
});
