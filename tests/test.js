const a = require("../routes/account");
const f = require("../routes/file");

test("creates id with 12 chars", () => {
    let id = a.createId();
    expect(id.length).toBe(12);
})