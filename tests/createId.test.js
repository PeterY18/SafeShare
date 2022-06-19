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
    let checker = /^[A-Za-z0-9]*$/.test(id1) // checking if the string only contains letters and numbers 
    expect(checker).toBe(true);
})