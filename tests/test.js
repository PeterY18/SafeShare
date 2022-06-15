const a = require("../routes/credential");
const f = require("../routes/file");
const create = require("../routes/helperFunctions/createId")

test("creates id with 12 chars", () => {
    let id = create.createId();
    expect(id.length).toBe(12);
})