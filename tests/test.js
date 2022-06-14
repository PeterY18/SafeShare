let a = require("../routes/account");
let f = require("../routes/file");

test("creates id with 12 chars", () => {
    let id = a.createId();
    expect(id.length).toBe(12);
})