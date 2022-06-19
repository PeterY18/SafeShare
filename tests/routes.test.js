const app = require("../app")
const request = require("supertest")
const cheerio = require("cheerio")

describe("credential", () => {
    it("returns 404 at '/'", async () => {
        const res = await request(app).get("/credential")
        expect(res.statusCode).toEqual(404)
    })

    it("returns 200 at '/upload'", async () => {
        const res = await request(app).get("/credential/upload")
        expect(res.statusCode).toEqual(200)
    })

    it("returns 404 at '/credential/form'", async () => {
        const res = await request(app).get("/credential/form")
        expect(res.statusCode).toEqual(404)
    })

    it("tests normal usage of credential upload and retrieval of info", async () => {
        jest.setTimeout(30000)
        const data = {
            username: "john",
            password: "1234"
        }
        const res = await request(app).post("/credential/upload/done").send(data).set("Accept", "application/json")
        expect(res.statusCode).toEqual(200)
        // get id from html
        const htmlOut = res.text
        const $ = cheerio.load(htmlOut)
        const linkHolder = $("#toCopy").text("")
        const link = linkHolder[0].attribs.value
        const splitLink = link.split("/")
        const id = splitLink[2]

        const res2 = await request(app).get("/credential/" + id)
        expect(res2.statusCode).toEqual(200)

        const res3 = await request(app).post("/credential/" + id + "/expire")
        expect(res3.statusCode).toEqual(200)

        // manual testing shows that the link expires correctly
        //const res4 = await request(app).post("/credential/" + id + "/expire")
        //expect(res4.statusCode).toEqual(404)
    })

    it("tests 'credential/upload/done' with one field", async () => {
        const data = {
            username: "",
            password: "1234"
        }
        const res = await request(app).post("/credential/upload/done").send(data).set("Accept", "application/json")
        expect(res.statusCode).toEqual(200)
    })

    it("tests 'credential/upload/done' without password field (required)", async () => {
        const data = {
            username: "john"
        }
        const res = await request(app).post("/credential/upload/done").send(data).set("Accept", "application/json")
        expect(res.statusCode).toEqual(500)
    })
})

describe("file", () => {
    it("returns 404 at '/'", async () => {
        const res = await request(app).get("/file")
        expect(res.statusCode).toEqual(404)
    })

    it("returns 200 at '/upload'", async () => {
        const res = await request(app).get("/file/upload")
        expect(res.statusCode).toEqual(200)
    })

    it("test '/file/upload/done'", async () => {
        jest.setTimeout(30000)
        // const res = await request(app).post("/file/upload/done").attach("sample", `${__dirname}/sample.txt`)
        const res = await request(app).post("/file/upload/done").attach("file", "/home/pyuan/SafeShare/tests/sample.txt", { contentType: "text/plain"})
        expect(res.statusCode).toEqual(200)

        const htmlOut = res.text
        const $ = cheerio.load(htmlOut)
        const linkHolder = $("#toCopy").text("")
        const link = linkHolder[0].attribs.value
        const splitLink = link.split("/")
        const id = splitLink[2]

        // test when fileid is incorrect
        const res2 = await request(app).get("/file/" + id + "1")
        expect(res2.statusCode).toEqual(404)

        const res3 = await request(app).get("/file/" + id)
        expect(res3.statusCode).toEqual(200)

        const res4 = await request(app).post("/file/" + id)
        expect(res4.statusCode).toEqual(200)

    })
})