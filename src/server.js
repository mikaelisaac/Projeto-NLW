const express = require("express")
const server = express()

//Pegar o banco de dados
const db = require("./database/db.js")

//config pasta publica
server.use(express.static("public"))

//Habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({extended: true}))


//utilizando template engine
const nunjucks = require("nunjucks")

nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

//configurar caminhos da aplicação
//pagina inicial
server.get("/", (req,res) =>{
    return res.render("index.html",{title: "Seu marketplace de coleta de resíduos"})
})

//pagina criar ponto de coleta
server.get("/create-point", (req,res) =>{
    //req.query: Query strings da URL
    console.log(req.query)

    return res.render("create-point.html")
})

//pagina criar ponto de coleta
server.post("/savepoint",(req,res) =>{
    //req.body: Corpo do nosso formulário
    //console.log(req.body)

    //Inserir dados no banco
    const query = `INSERT INTO places (
                    image,
                    name,
                    address,
                    address2,
                    state,
                    city,
                    items
                ) VALUES (?,?,?,?,?,?,?);`

    const values = [req.body.image,
                    req.body.name,
                    req.body.address,
                    req.body.address2,
                    req.body.state,
                    req.body.city,
                    req.body.items]

    function afterInsertData(err){
        if(err){
            console.log(err)
            return res.send("Erro no cadastro")
        }

        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html",{saved: true})
    }

    db.run(query, values, afterInsertData)
    
})

//pagina mostra resultados
server.get("/search", (req,res) =>{
    const search =  req.query.search

    if(search == ""){
        //Pesquisa vazia
        return res.render("search-results.html", {total: 0 })
    }
    
    //Pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows){
        if(err){
            return console.log(err)
        }

        //Contador de registros encontrados
        const total = rows.length

        //Mostra a poagina html com os dados do banco
        return res.render("search-results.html", { places: rows, total: total })
    })
})

//liga o servidor
server.listen(3000)