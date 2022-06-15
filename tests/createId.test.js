const a = require("../routes/account");
const f = require("../routes/file");
const create = require("../routes/createId")

test("creates id with 12 chars", () => {
    let id = create.createId();
    expect(id.length).toBe(12);
})

test('no special chars', () =>{
    let id1 = create.createId();
    expect(id1).toEqual(expect.not.stringMatching("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"));
})

