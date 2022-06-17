const create = require("../routes/helperFunctions/createId")

afterAll(done => {
    done();
});

test("creates id with 12 chars", () => {
    let id = create.createId();
    expect(id.length).toBe(12);
})

test('no special chars', () =>{
    let id1 = create.createId();
    expect(id1).toEqual(expect.not.stringMatching("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"));
})

