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
    let wrong = false
    
    for(let i = 0; i < 12; i++)
    {
        if(id1.charAt(i))
        {
            
        }
    }

    expect(wrong).toBe(false)
})

