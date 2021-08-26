var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const ejs = require('ejs')
var path = require('path');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'btp_manager',
    port: 3306
});

connection.connect((err) => {
	if(err)
	{
		console.log('ERROR detected!');
		throw err;
	}
	else 
		console.log('MySQL connected.');
});

var app = express();
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended : true}))
app.use(bodyParser.json())

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(express.static("public"));


app.get('/', function(req, res) {
    res.render('index')
});

app.get('/about', function(req, res) {
    res.send('ABOUT')
});

app.get('/contact', function(req, res) {
    res.send('CONTACT')
});

app.get('/student_reg', function(req,res){
    var message = ""
    res.render('student_reg' ,{
        message : message
    } )
})

app.get('/prof_reg', function(req,res){
    var message = ""
    res.render('prof_reg' ,{
        message : message
    } )
})

app.get('/student_home', function(request, response) {
	if (request.session.loggedin) {
        console.log(request.session)

        // response.locals.username = request.session.username    CAN be used to display username in chrome tab 

        response.render("student_home", {
            username : request.session.username
        })
	} else {
		response.render('student_login', {
            message : "Please login first"
        })
	}
	// response.end();
});

app.get('/prof_home', function(request, response) {
	if (request.session.loggedin) {
        console.log(request.session)

        // response.locals.username = request.session.username    CAN be used to display username in chrome tab 

        response.render("prof_home", {
            username : request.session.username
        })
	} else {
		response.render('prof_login', {
            message : "Please login first"
        })
	}
	// response.end();
});

app.get('/student_login', function(req,res){
    var message = ""
    res.render('student_login', {
        message : message
    })
})

app.get('/logout', function(req, res){
    // consol.log( request.session.username + " just LOGGED OUT")
    req.session.loggedin = false;
    res.redirect("/")
})

app.get('/stud_search_tag',(req,res) => {
    if(req.session.loggedin){
        console.log(req.session.username + " is trying to search by tag.");
        var sql='select tag_name from tag';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else
            {
                console.log(result);
                res.render("stud_search_tag",{
                    username : req.session.username,
                    tag_list : result
                })
            }
		});
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
});

app.post('/stud_search_tag',function(req,res){
    if(req.session.loggedin){
        console.log(req.session.username + " is searching for projects with tags.");
        var sql='select project.project_id,project.prof_id,project.title,project.description,professor.first_name,professor.last_name from project,project_tag,professor where project.project_id=project_tag.project_id and professor.prof_id=project.prof_id and project_tag.tag_name="'+req.body.tag_name+'"';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else
            {
                console.log(result)
                res.render("view_projects",{
                    username : req.session.username,
                    project_list : result,
                    message : 'Projects found with tag="'+req.body.tag_name+'"'
                })
            }
		});
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})

app.get('/student_add_phone',(req,res) => {
    if(req.session.loggedin){
        console.log(req.session.username + " is trying to view/add phone.");
        var sql='select phone from student_phone where student_id="'+req.session.username+'"';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else
            {
                console.log(result);
                res.render("student_add_phone",{
                    username : req.session.username,
                    phone_list : result,
                    message : ""
                })
            }
		});
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
});

app.post('/student_add_phone',(req,res) => {
    if(req.session.loggedin){
        console.log(req.session.username + " added a phone.");
        var sql='select count(*) as ph_ct from student_phone where phone="'+req.body.phone_num+'"';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else if(result[0].ph_ct)
            {
                console.log(result);
                sql='select phone from student_phone where student_id="'+req.session.username+'"';
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        console.log(result);
                        res.render("student_add_phone",{
                            username : req.session.username,
                            phone_list : result,
                            message : "This phone number already exists."
                        })
                    }
                });
            }
            else
            {
                if(req.body.phone_num.length!=10)
                {
                    sql='select phone from student_phone where student_id="'+req.session.username+'"';
                    connection.query(sql,(err,result)=>
                    {
                        if(err)
                        {
                            console.log(err);
                            throw err;
                        }
                        else
                        {
                            console.log(result);
                            res.render("student_add_phone",{
                                username : req.session.username,
                                phone_list : result,
                                message : "Inserted phone number has a wrong format.(not 10 digits)"
                            })
                        }
                    });
                }
                else
                {
                    sql='insert into student_phone values("'+req.session.username+'","'+req.body.phone_num+'")';
                    connection.query(sql,(err,result)=>
                    {
                        if(err)
                        {
                            console.log(err);
                            throw err;
                        }
                        else
                        {
                            console.log(result);
                            //add success message afterwards
                            res.render("student_home",{
                                username : req.session.username
                            })
                        }
                    });
                }
            }
		});
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
});

app.get('/prof_add_phone',(req,res) => {
    if(req.session.loggedin){
        console.log(req.session.username + " is trying to view/add phone.");
        var sql='select phone from professor_phone where prof_id="'+req.session.username+'"';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else
            {
                console.log(result);
                res.render("prof_add_phone",{
                    username : req.session.username,
                    phone_list : result,
                    message : ""
                })
            }
		});
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
});

app.post('/prof_add_phone',(req,res) => {
    if(req.session.loggedin){
        console.log(req.session.username + " added a phone.");
        var sql='select count(*) as ph_ct from professor_phone where phone="'+req.body.phone_num+'"';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else if(result[0].ph_ct)
            {
                console.log(result);
                sql='select phone from professor_phone where prof_id="'+req.session.username+'"';
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        console.log(result);
                        res.render("prof_add_phone",{
                            username : req.session.username,
                            phone_list : result,
                            message : ""
                        })
                    }
                });
                res.render("prof_add_phone",{
                    username : req.session.username,
                    phone_list : result,
                    message : "This phone already exists."
                })
            }
            else
            {
                if(req.body.phone_num.length!=10)
                {
                    sql='select phone from professor_phone where prof_id="'+req.session.username+'"';
                    connection.query(sql,(err,result)=>
                    {
                        if(err)
                        {
                            console.log(err);
                            throw err;
                        }
                        else
                        {
                            console.log(result);
                            res.render("prof_add_phone",{
                                username : req.session.username,
                                phone_list : result,
                                message : "Inserted phone number has a wrong format.(not 10 digits)"
                            })
                        }
                    });
                }
                else{
                    sql='insert into professor_phone values("'+req.session.username+'","'+req.body.phone_num+'")';
                    connection.query(sql,(err,result)=>
                    {
                        if(err)
                        {
                            console.log(err);
                            throw err;
                        }
                        else
                        {
                            console.log(result);
                            //add success message afterwards
                            res.render("prof_home",{
                                username : req.session.username
                            })
                        }
                    });
                }
            }
		});
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
});

app.get('/add_tag_proj',(req,res) => {
    if(req.session.loggedin){
        console.log(req.session.username + " is trying to add a tag.");
        var sql='select tag_name from tag';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else
            {
                console.log(result);
                res.render("add_tag_proj",{
                    username : req.session.username,
                    tag_list : result,
                    message : ""
                })
            }
		});
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
});


app.post('/add_tag_proj',function(req,res){
    if(req.session.loggedin){
        console.log(req.session.username + " is adding a tag.");
        var sql='select count(*) as cnt_proj from project where project_id='+req.body.proj_id + ' and prof_id = "' + req.session.username + '"';
        //console.log(req.body.proj_id);
        //console.log(req.body.tag_name);
	    connection.query(sql,(err,result)=>
		{
            console.log(result);
            if(result[0].cnt_proj == 0)
            {
                sql='select tag_name from tag';
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        console.log(result);
                        res.render("add_tag_proj",{
                            username : req.session.username,
                            tag_list : result,
                            message : "Enter correct Project ID (see in show projects)"
                        })
                    }
                });
            }
            else
            {
                sql='select count(*) as cnt_tag from tag where tag_name = "' + req.body.tag_name + '"';
                connection.query(sql,(err,result)=>
                {
                    if(result[0].cnt_tag == 0)
                    {
                        sql='select tag_name from tag';
                        connection.query(sql,(err,result)=>
                        {
                            if(err)
                            {
                                console.log(err);
                                throw err;
                            }
                            else
                            {
                                console.log(result);
                                res.render("add_tag_proj",{
                                    username : req.session.username,
                                    tag_list : result,
                                    message : "Enter correct Tag Name (see from below)"
                                })
                            }
                        });
                    }
                    else{
                        sql = 'insert into project_tag values("' + req.body.tag_name + '",' + req.body.proj_id +')';
                        connection.query(sql,(err,result)=>{
                            console.log('Tag inserted');
                            res.render('prof_home',{
                                username : req.session.username
                            })
                        })
                    }
                })
                
            }
        })        
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})


app.get('/student_fill_pref', function(req, res){
    if (req.session.loggedin) {
        
        console.log( req.session.username + " is accessing /student_fill_pref page.")

        res.render("student_fill_pref", {
            username : req.session.username
        })
	} else {
		res.render('student_login', {
            message : "Please login first"
        })
	}
})

app.get('/prof_login', function(req,res){
    var message = ""
    res.render('prof_login', {
        message : message
    })
})

app.get('/addproject',function(req,res){
    if(req.session.loggedin){
        console.log(req.session.username + "is accessing /addproject page.");
        res.render("addproject",{
            username : req.session.username
        })
    }
    else {
        res.render('prof_login',{
            message: "Please login first"
        })
    }
})

app.get('/add_ta',function(req,res){
    if(req.session.loggedin){
        console.log(req.session.username + "is accessing /add_ta.");
        res.render("add_ta",{
            username : req.session.username
        })
    }
    else {
        res.render('prof_login',{
            message: "Please login first"
        })
    }
})

app.post('/add_ta',(req,res)=>{
    let sql='insert into ta values("'+req.body.roll_no+'","'+req.session.username+'","'+req.body.f_name+'","'+req.body.l_name+'","'+req.body.email+'")';
    //console.log(sql);
    console.log(req.session.username + " added a TA.");
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            //add message thing in here
            res.render("prof_home",{
                username : req.session.username
            });
		});
});

app.get('/show_ta', (req, res)=> {
    if(req.session.loggedin){
        console.log("Prof."+req.session.username + " is viewing TA.");
        let sql='select * from ta where prof_id="'+req.session.username +'"';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
            }
            console.log(result);
            res.render("show_ta",{
                username : req.session.username,
                ta_list : result,
                message : ""
            })
		});
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
})

app.get('/update_ta',(req,res)=>{
    if(req.session.loggedin){
        console.log(req.session.username + " is seeing /update_ta");
        res.render("update_ta",{
            message : ""
        })
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
});

app.get('/update_ta/:id',(req,res)=>{
    if(req.session.loggedin){
        console.log(req.session.username + " is seeing /update_ta");
        var sql='select count(*) as ta_ct from ta where prof_id="'+req.session.username+'" and ta_id="'+req.params.id+'"';
        connection.query(sql,(err,result) => {
            if(err)
            {
                console.log(err);
                throw err;
            }
            else if(result[0].ta_ct)
            {
                sql='select * from ta where ta_id="'+req.params.id+'"';
                connection.query(sql,(err,result) => {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        res.render('update_ta',{
                            username : req.session.username,
                            ta : result[0],
                            message : ''
                        });
                    } 
                });
            }
            else
            {
                sql='select * from ta where prof_id="'+req.session.username+'"';
                connection.query(sql,(err,result) => {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        res.render('show_ta',{
                            username : req.session.username,
                            ta_list : result,
                            message : 'No such TA available.'
                        });
                    } 
                });
            }
        });
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
});

app.get('/del_ta/:id',(req,res) => {
    if(req.session.loggedin){
        //async stuff should be done here
        //check if that project belongs to the professor first
        var sql='select count(*) as ta_ct from ta where ta.prof_id="'+req.session.username+'" and ta.ta_id="'+req.params.id+'"';
        connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else if(result[0].ta_ct==0)
            {
                let sql='select * from ta where prof_id="'+req.session.username+'"';
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                    }
                    console.log(result);
                    res.render("show_ta",{
                        username : req.session.username,
                        ta_list : result,
                        message : "No such TA exists."
                    })
                });
            }
            else
            {
                sql='delete from ta where prof_id="'+req.session.username+'" and ta_id="'+req.params.id+'"';
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        let sql='select * from ta where prof_id="'+req.session.username+'"';
                        connection.query(sql,(err,result)=>
                        {
                            if(err)
                            {
                                console.log(err);
                            }
                            console.log(result);
                            res.render("show_ta",{
                                username : req.session.username,
                                ta_list : result,
                                message : "TA deleted successfully."
                            })
                        });
                    }
                });
            }
		});
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
});

app.post('/update_ta/:id',(req,res)=>{
    if(req.session.loggedin){
        console.log(req.session.username + " is  updating ta.");
        console.log(req.body.f_name)
        var sql = 'update ta set first_name="' + req.body.f_name + '",last_name="'+ req.body.l_name+'",email="' + req.body.email + '"  where ta_id="' + req.params.id +'"';
        connection.query(sql,(err,result)=>{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else
            {
                console.log(req.params.id)
                sql = 'select * from ta where prof_id="'+req.session.username+'"';
                connection.query(sql,(err,result) => {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        res.render("show_ta",{
                            username : req.session.username,
                            ta_list : result,
                            message : "TA Updated Successfully!!"
                        })
                    }
                });
            }
        })        
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
})

app.get('/add_bookmark',function(req,res){
    if(req.session.loggedin){
        console.log(req.session.username + " is trying to add a bookmark.");
        res.render("add_bookmark",{
            username : req.session.username
        })
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})

app.post('/add_bookmark',function(req,res){
    if(req.session.loggedin)
    {
        console.log(req.session.username + " is adding a bookmark.");
        var sql='select count(*) as proj_exist from project where project_id='+req.body.project_id;
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else if(result[0].proj_exist)
            {
                sql='select count(*) as bookmark_exist from bookmark where project_id='+req.body.project_id+' and student_id="'+req.session.username+'"';
                //console.log(sql);
                connection.query(sql,(err,result)=>
                {
                    console.log(sql);
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else if(result[0].bookmark_exist)
                    {
                        sql='select project.project_id,project.prof_id,project.title,project.description from project,bookmark where bookmark.student_id="'+req.session.username+'" and bookmark.project_id=project.project_id';
                        connection.query(sql,(err,result)=>
                        {
                            console.log(result);
                            res.render("view_bookmark",{
                                username : req.session.username,
                                bookmark_list : result,
                                message : "Bookmark already exists."
                            });
                        });
                    }
                    else
                    {
                        sql='insert into bookmark values("'+req.session.username+'",'+req.body.project_id+')';
                        console.log(req.session.username + " Bookmark Added.");
                        connection.query(sql,(err,result)=>
                        {
                            if(err)
                            {
                                console.log(err);
                                throw err;
                            }
                            //sql='select * from student where student_id="'+req.session.username+'"';
                            sql='select project.project_id,project.prof_id,project.title,project.description from project,bookmark where bookmark.student_id="'+req.session.username+'" and bookmark.project_id=project.project_id';
                            connection.query(sql,(err,result)=>
                            {
                                console.log(result)
                                res.render("view_bookmark",{
                                    username : req.session.username,
                                    bookmark_list : result,
                                    message : "Bookmark successfully added."
                                });
                            });
                        });
                    } 
                });
            }
            else
            {
                sql='select project.project_id,project.prof_id,project.title,project.description from project,bookmark where bookmark.student_id="'+req.session.username+'" and bookmark.project_id=project.project_id';
                connection.query(sql,(err,result)=>
                {
                    console.log(result)
                    res.render("view_bookmark",{
                        username : req.session.username,
                        bookmark_list : result,
                        message : "No such project exists."
                    })
                });
            }
		});
    }
    else
    {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})

app.get('/give_preference',function(req,res){
    if(req.session.loggedin){
        console.log(req.session.username + " is accessing /give_preference page.")

        var q = 'select * from student where student_id="' + req.session.username + '"'
        
        connection.query(q, (err, result) => {
            if(err) {
                res.send("error occoured while searching you in database")
                throw err
            }
            else{
                console.log(result[0])
                res.render("give_preference",{
                    username : req.session.username,
                    message : "" ,
                    user : result[0]
                })
            }
        })
    }
    else {
        res.render('student_login',{
            message: "Please login first"
        })
    }
})

app.post("/give_preference", (req,res)=>{
    if(req.session.loggedin){
        console.log(req.body)
        // set the project preferences of student here
        // let sql = 'update student set email="' + req.body.email + '",' +  'cgpa =' + req.body.cgpa + ', dept="' + req.body.dept + '" where student_id="'+req.session.username+'"';

        var q = 'update student set pref_1=' + req.body.p1 + ', pref_2=' + req.body.p2 + ', pref_3 = ' + req.body.p3  + ', pref_4=' + req.body.p4+ ', pref_5=' + req.body.p5+ ', pref_6=' + req.body.p6+ ', pref_7=' + req.body.p7+ ', pref_8=' + req.body.p8 + ' where student_id = "' + req.session.username + '"' ;
        connection.query(q, (err , result)=>{
            if(err){
                throw err
            }else{
                var sql = 'select * from student where student_id="' + req.session.username + '"'
                connection.query(sql, (err, result2)=>{
                    if(err) throw err
                    else{
                        res.render('give_preference',{
                            message : "Saved Successfully",
                            user : result2[0]
                        })
                    }
                })
            }
        })
    }
    else{
        res.redirect("student_login")
    }
})

//for students
app.get('/view_projects', (req, res)=> {
    if(req.session.loggedin){
        console.log(req.session.username + " is viewing projects.");
        let sql='select proj.project_id, proj.prof_id, proj.title, proj.description, prof.first_name, prof.last_name from project as proj inner join professor as prof on prof.prof_id = proj.prof_id order by prof.prof_id, proj.project_id';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
            }
            console.log(result);
            res.render("view_projects",{
                username : req.session.username,
                project_list : result,
                message : ""
            })
		});
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})

//for prof
app.get('/show_projects', (req, res)=> {
    if(req.session.loggedin){
        console.log("Prof."+req.session.username + " is viewing projects.");
        var sql='select * from project where prof_id="'+req.session.username +'"';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
            }
            console.log(result);
            res.render("show_projects",{
                username : req.session.username,
                project_list : result,
                message : ""
            })
		});
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
})

// anyone accessing project details
app.get('/view_proj_detail/:id', (req,res)=>{
    if(req.session.loggedin){
        //var id = req.params.id;
        //yaha oar check lagana hai if project exists
        var sql='select project.project_id, project.prof_id, project.title, project.description, professor.first_name, professor.last_name from professor,project where professor.prof_id=project.prof_id and project.project_id='+req.params.id; 
        connection.query(sql, (err,result_proj)=>{
            if(err)
            {
                console.log(err)
                throw err
            }
            else if(result_proj.length==0)
            {
                res.send('No such project exists');
            }
            else
            {   
                sql='select tag_name from project_tag where project_id='+req.params.id;
                connection.query(sql, (err,result_tag)=>{
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        res.render('view_proj_detail',{
                            project : result_proj[0],
                            tag_list : result_tag,
                            username : req.session.username,
                            user_type : req.session.user_type,
                            message : ''
                        });
                    }
                });
                
            }
        })
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})


app.get('/del_project/:id',(req,res) => {
    if(req.session.loggedin){
        //async stuff should be done here
        //check if that project belongs to the professor first
        var sql='select count(*) as proj_ct from project where project.prof_id="'+req.session.username+'" and project.project_id='+req.params.id;
        connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else if(result[0].proj_ct==0)
            {
                let sql='select * from project where prof_id="'+req.session.username +'"';
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                    }
                    console.log(result);
                    res.render("show_projects",{
                        username : req.session.username,
                        project_list : result,
                        message : "Access Denied."
                    })
                });
            }
            else
            {
                sql='delete from bookmark where bookmark.project_id='+req.params.id;
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                });
                sql='delete from project where prof_id="'+req.session.username+'" and project_id='+req.params.id;
                console.log(req.session.username + " deleted project.");
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    let sql='select * from project where prof_id="'+req.session.username +'"';
                    connection.query(sql,(err,result)=>
                    {
                        if(err)
                        {
                            console.log(err);
                        }
                        console.log(result);
                        res.render("show_projects",{
                            username : req.session.username,
                            project_list : result,
                            message : "Project deleted successfully."
                        })
                    });
                });
            }
		});
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
});

app.get('/del_bookmark/:id',(req,res) => {
    if(req.session.loggedin){
        //async stuff should be done here
        //check if that project belongs to the professor first
        var sql='select count(*) as book_ct from bookmark where bookmark.student_id="'+req.session.username+'" and bookmark.project_id='+req.params.id;
        connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else if(result[0].book_ct==0)
            {
                let sql='select * from bookmark where student_id="'+req.session.username +'"';
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                    }
                    console.log(result);
                    res.render("view_bookmark",{
                        username : req.session.username,
                        bookmark_list : result,
                        message : "Access Denied."
                    })
                });
            }
            else
            {
                sql='delete from bookmark where bookmark.project_id='+req.params.id+' and bookmark.student_id="'+req.session.username+'"';
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        let sql='select project.project_id,project.prof_id,project.title,project.description from project,bookmark where bookmark.student_id="'+req.session.username+'" and bookmark.project_id=project.project_id';
                        connection.query(sql,(err,result)=>
                        {
                            if(err)
                            {
                                console.log(err);
                            }
                            console.log(result);
                            res.render("view_bookmark",{
                                username : req.session.username,
                                bookmark_list : result,
                                message : "Bookmark deleted successfully."
                            })
                        });
                    }
                });
            }
		});
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
});

app.get('/view_bookmark', (req, res)=> {
    if(req.session.loggedin){
        console.log(req.session.username + " is seeing view_bookmark.");
        let sql='select project.project_id,project.prof_id,project.title,project.description from project,bookmark where bookmark.student_id="'+req.session.username+'" and bookmark.project_id=project.project_id';
	    connection.query(sql,(err,result)=>
		{
            console.log(result)
            res.render("view_bookmark",{
                username : req.session.username,
                bookmark_list : result,
                message : ""
            })
		});
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})

app.get('/del_bookmark',function(req,res){
    if(req.session.loggedin){
        console.log(req.session.username + " is trying to delete a bookmark.");
        res.render("del_bookmark",{
            username : req.session.username
        })
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})

app.post('/del_bookmark',function(req,res){
    if(req.session.loggedin){
        let sql='delete from bookmark where student_id="'+req.session.username+'" and project_id='+req.body.project_id;
        console.log(req.session.username + " Bookmark deleted.");
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            let sql='select project.project_id,project.prof_id,project.title,project.description from project,bookmark where bookmark.student_id="'+req.session.username+'" and bookmark.project_id=project.project_id';
            connection.query(sql,(err,result)=>
            {
                if(err)
                {
                    console.log(err);
                    throw err;
                }
                console.log(result)
                res.render("view_bookmark",{
                    username : req.session.username,
                    bookmark_list : result,
                    message : "Bookmark successfully deleted."
                })
            });
		});
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})

app.get('/show_ta_student',(req,res)=>{
    if(req.session.loggedin){
        console.log(req.session.username + " is seeing a show_ta_student.");
        //res.render("student-updateDetails",{
            //username : req.session.username
            res.render('show_ta_student',{
                message : ""
            })
       // })
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})

app.post('/show_ta_student',(req,res)=>{
    if(req.session.loggedin){
        let sql = 'select count(*) as cnt from professor where prof_id = "' + req.body.prof_id +'"';
        connection.query(sql,(err,result)=>{
            if(result[0].cnt==0){
                console.log(err);
                res.render('show_ta_student',{
                    message : "Please enter valid Professor Id"
                })
            }
            else{
                let sql = 'select first_name from professor where prof_id = "' + req.body.prof_id +'"';
                connection.query(sql,(err,result)=>{
                    var fname = result[0].first_name;
                    let sql = 'select * from ta where prof_id ="' + req.body.prof_id +'"';
                    connection.query(sql,(err,result)=>{
                        res.render('show_ta_student_list',{
                            first_name : fname,
                            ta_list : result
                        })
                    })
                })
            }
        })
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})

app.get('/student_update_details',(req,res)=>{
    if(req.session.loggedin){
        console.log(req.session.username + " is seeing a update_details.");
        //res.render("student-updateDetails",{
            //username : req.session.username
            let sql = 'select * from student where student_id="'+req.session.username+'"';
            connection.query(sql,(err,result)=>
		    {
                console.log(result[0])
                res.render("student-updateDetails",{
                    user : result[0],
                    message : ""
                })
		    });
       // })
    }
    else {
        res.render('student_login',{
            message: "Please login first."
        })
    }
})

app.get('/prof_update_project/:id',(req,res)=>{
    if(req.session.loggedin){
        console.log(req.session.username + " is in prof_update_project");
        var sql='select count(*) as is_pres from project where prof_id="'+req.session.username+'" and project_id='+req.params.id;
        connection.query(sql,(err,result) => {
            if(err)
            {
                console.log(err);
                throw err;
            }
            else if(result[0].is_pres)
            {
                sql='select * from project where prof_id="'+req.session.username+'" and project_id='+req.params.id;
                connection.query(sql,(err,result) => {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        console.log(result);
                        res.render('prof_update_project',{
                            username : req.session.username,
                            project : result[0],
                            message : ""
                        });
                    }
                });
            }
            else
            {
                sql='select * from project where prof_id="'+req.session.username+'"';
                connection.query(sql,(err,result) => {
                    if(err)
                    {
                        console.log(err);
                        throw err;
                    }
                    else
                    {
                        res.render('show_projects',{
                            username : req.session.username,
                            project_list : result,
                            message : "No such project exists."
                        });
                    }
                });
            }
        });
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
});

//jugaad thoda
app.post('/prof_update_project/:id',(req,res)=>{
    if(req.session.loggedin){
        console.log(req.session.username + " is seeing a prof_update_project");
        var sql = 'update project set title="' + req.body.project_title + '",description="' + req.body.project_desc + '"where project_id=' + req.params.id ;
        connection.query(sql,(err,result)=>{
            if(err)
            {
                console.log(err);
                throw err;
            }
            else 
            {
                sql='select * from project where prof_id="'+req.session.username +'"';
                connection.query(sql,(err,result)=>
                {
                    if(err)
                    {
                        console.log(err);
                        throw(err);
                    }
                    else
                    {    
                        console.log(result);
                        res.render("show_projects",{
                            username : req.session.username,
                            project_list : result,
                            message : "Project updated successfully."
                        });
                    }
                });
            }
        })        
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
})

/*app.get('/prof_update_project',(req,res)=>{
    if(req.session.loggedin){
        console.log(req.session.username + " is seeing a prof_update_project");
        res.render("prof_update_project",{
            message : ""
        })
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
})

app.post('/prof_update_project',(req,res)=>{
    if(req.session.loggedin){
        console.log(req.session.username + " is seeing a prof_update_project");
        let sql = 'update project set title="' + req.body.project_title + '",description="' + req.body.project_desc + '"where project_id=' + req.body.project_id ;
        //'update student set email="' + req.body.email + '",' +  'cgpa =' + req.body.cgpa + ', dept="' + req.body.dept + '" where student_id="'+req.session.username+'"';
        connection.query(sql,(err,result)=>{
            if(err) throw err
            else {
                res.render("prof_update_project",{
                    message : "Project Updated Successfully!!"
                })
            }
        })        
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
})*/



// post routes ----------------------

app.post('/student_reg', function(req,res){
    if(req.body.password != req.body.password2){
        res.render('student_reg',{
            message : "Passwords do not match"
        })
    }
    else{
        var q = 'insert into student values("' + req.body.username+'","'+req.body.password+'","'+ req.body.f_name + '","' + req.body.l_name + '","' + req.body.dept+'","'+req.body.email+'",' + req.body.cgpa + ',null,null,null,null,null,null,null,null,null)';
        connection.query(q, (err,result) => {
            if(err){
                console.log(err)
                res.render('student_reg', {
					message: "Error  in insertion"
				});
            }
            else{
                res.render("student_login", {
					message : "Registered successfully."
				})
            }
        })

    }
})

app.post('/addproject',(req,res)=>{
    var sql='insert into project(prof_id,title,description) values("'+req.session.username+'","'+req.body.proj_title+'","'+req.body.proj_desc+'")';
    //console.log(sql);
    console.log(req.session.username + " added a project.");
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
                throw err;
            }
            sql='select * from project where prof_id="'+req.session.username+'"';
            connection.query(sql,(err,result)=>
            {
                console.log(result)
                res.render("show_projects",{
                    username : req.session.username,
                    project_list : result,
                    message : "Project successfully added."
                })
            });
		});
})

app.post('/student_update_details',(req,res)=>{
    if(req.session.loggedin){
        let sql = 'update student set email="' + req.body.email + '",' +  'cgpa =' + req.body.cgpa + ', dept="' + req.body.dept + '" where student_id="'+req.session.username+'"';
        connection.query(sql,(err,result)=>{
        if(err){
            throw err;
        }
        else{

            let q = 'select * from student where student_id="'+req.session.username+'"';
            connection.query( q ,(err,result2)=>
		    {   
                if(err){
                    throw err
                }
                else{
                    // console.log("if undefined is printed below then load h")
                    // console.log(result2[0])
                    res.render("student-updateDetails",{
                        user : result2[0],
                        message : "updated successfully!!"
                    })
                }
		    });
            
        }
        
    })}
    else{
        res.redirect("/student_login")
    }
})
app.post('/student_login', (request, response) => {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
        
        var q = 'select * from student where student_id="' + username + '"and password="' + password +'"' ;

		connection.query(q , function(error, results, fields) {
			if ( results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
                request.session['user_type']='student';
				console.log(request.session);
                response.redirect('student_home');
                
			} else {
                response.render('student_login', {
                    message : 'Incorrect Username and/or Password!'
                })
				// response.send('Incorrect Username and/or Password!');
			}			
			
		});
	} else {
		response.send('Please enter Username and Password!');
		// response.end();
	}
});


app.post('/prof_login', (request, response) => {
	var username = request.body.username;
	var password = request.body.password;

	if (username && password) {
        
        var q = 'select * from professor where prof_id="' + username + '" and password="' + password +'"' ;

		connection.query(q , function(error, results, fields) {
			if ( results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				request.session['user_type']='prof';
				console.log(request.session);
                response.redirect('prof_home');
                
			} else {
                response.render('prof_login', {
                    message : 'Incorrect Username and/or Password!'
                })
				// response.send('Incorrect Username and/or Password!');
			}			
			
		});
	} else {
		response.send('Please enter Username and Password!');
		// response.end();
	}
});

app.post('/prof_reg', function(req,res){
    if(req.body.password != req.body.password2){
        res.render('prof_reg',{
            message : "Passwords do not match"
        })
    }
    else{
        console.log(req.body);
        var q = 'insert into professor values("' + req.body.username+'","'+req.body.password+'","'+ req.body.f_name + '","' + req.body.l_name + '","' + req.body.dept+'","'+req.body.email+'")';
        connection.query(q, (err,result) => {
            if(err){
                console.log(err)
                res.render('prof_reg', {
					message: "Error  in insertion"
				});
            }
            else{
                res.render("prof_login", {
					message : "Registered successfully."
				})
            }
        })
    }
});

app.get('/allocated_students',(req,res) => {
    if(req.session.loggedin)
    {
        var sql='select student.student_id,student.email,student.allocated_proj_id from student,project where student.allocated_proj_id=project.project_id and project.prof_id="'+req.session.username+'"';
        connection.query(sql, (err,result) => {
            if(err)
            {
                console.log(err)
                throw err;
            }
            else
            {
                res.render("allocated_students",{
                    username : req.session.username,
                    student_list : result
				})
            }
        })
    }
    else {
        res.render('prof_login',{
            message: "Please login first."
        })
    }
});

//Admin functions

app.get("/admin_login", function(req, res) {
    res.render('admin_login', {
        message : ""
    });
});

app.post('/admin_login', (request, response) => {
	var username = request.body.username;
	var password = request.body.password;
    console.log(request.session);
	if (username && password) {
        
        var q = 'select * from admin_table where admin_id="' + username + '"and password="' + password +'"' ;

		connection.query(q , function(error, results, fields) {
			if ( results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				request.session['user_type']='admin';
				console.log(request.session);
                response.redirect('admin_home');
                
			} else {
                response.render('admin_login', {
                    message : 'Incorrect Username and/or Password!'
                })
				// response.send('Incorrect Username and/or Password!');
			}			
			
		});
	} else {
		response.send('Please enter Username and Password!');
		// response.end();
	}
});

app.get('/admin_home', function(request, response) {
	if (request.session.loggedin) {
        console.log(request.session)

        // response.locals.username = request.session.username    CAN be used to display username in chrome tab 

        response.render("admin_home", {
            username : request.session.username
        })
	} else {
		response.render('admin_login', {
            message : "Please login first"
        })
	}
	// response.end();
});


//for admin
app.get('/view_project_admin', (req, res)=> {
    if(req.session.loggedin){
        console.log(req.session.username + " is viewing projects.");
        let sql='select proj.project_id, proj.prof_id, proj.title, proj.description, prof.first_name, prof.last_name from project as proj inner join professor as prof on prof.prof_id = proj.prof_id';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
            }
            console.log(result);
            res.render("view_project_admin",{
                username : req.session.username,
                project_list : result,
                message : ""
            })
		});
    }
    else {
        res.render('admin_login',{
            message: "Please login first."
        })
    }
})


//for admin
app.get('/view_student_admin', (req, res)=> {
    if(req.session.loggedin){
        console.log(req.session.username + " is viewing students.");
        let sql='select * from student';
	    connection.query(sql,(err,result)=>
		{
            if(err)
            {
                console.log(err);
            }
            console.log(result);
            res.render("view_student_admin",{
                username : req.session.username,
                student_list : result,
                message : ""
            })
		});
    }
    else {
        res.render('admin_login',{
            message: "Please login first."
        })
    }
})

app.get('/allocate_student',(req,res) => {
    if (req.session.loggedin) {
        res.render("allocate_student", {
            username : req.session.username,
            message : ""
        })
	} else {
		res.render('admin_login', {
            message : 'Please login first'
        })
	}
});

app.post('/allocate_student',(req,res) => {
    if (req.session.loggedin)
    {
        console.log(req.session.username+'is going to allocate projects.');
        var sql='select count(*) as is_an_admin from admin_table where admin_id="'+req.body.admin_id+'"';
        connection.query(sql,(err,result) => {
            if(err)
            {
                console.log(err);
                throw err;
            }
            else if(result[0].is_an_admin)
            {
                sql='select student_id,pref_1,pref_2,pref_3,pref_4,pref_5,pref_6,pref_7,pref_8 from student order by cgpa desc';
                connection.query(sql,(err,result_stud) => {
                    sql='select project_id from project';
                    connection.query(sql,(err,result_proj) => {
                        if(err)
                        {
                            console.log(err);
                            throw(err);
                        }
                        console.log(result_proj);
                        var projects = new Set();
                        var allocation = new Map();
                        for(var i=0;i<result_proj.length;i++)
                        {
                            projects.add(result_proj[i].project_id);
                        }
                        console.log(result_stud);
                        console.log(projects);
                        for(var i=0;i<result_stud.length;i++)
                        {
                            if(projects.has(result_stud[i].pref_1))
                            {
                                projects.delete(result_stud[i].pref_1);
                                allocation.set(result_stud[i].student_id,result_stud[i].pref_1);
                            }
                            else if(projects.has(result_stud[i].pref_2))
                            {
                                projects.delete(result_stud[i].pref_2);
                                allocation.set(result_stud[i].student_id,result_stud[i].pref_2);
                            }
                            else if(projects.has(result_stud[i].pref_3))
                            {
                                projects.delete(result_stud[i].pref_3);
                                allocation.set(result_stud[i].student_id,result_stud[i].pref_3);
                            }
                            else if(projects.has(result_stud[i].pref_4))
                            {
                                projects.delete(result_stud[i].pref_4);
                                allocation.set(result_stud[i].student_id,result_stud[i].pref_4);
                            }
                            else if(projects.has(result_stud[i].pref_5))
                            {
                                projects.delete(result_stud[i].pref_5);
                                allocation.set(result_stud[i].student_id,result_stud[i].pref_5);
                            }
                            else if(projects.has(result_stud[i].pref_6))
                            {
                                projects.delete(result_stud[i].pref_6);
                                allocation.set(result_stud[i].student_id,result_stud[i].pref_6);
                            }
                            else if(projects.has(result_stud[i].pref_7))
                            {
                                projects.delete(result_stud[i].pref_7);
                                allocation.set(result_stud[i].student_id,result_stud[i].pref_7);
                            }
                            else if(projects.has(result_stud[i].pref_8))
                            {
                                projects.delete(result_stud[i].pref_8);
                                allocation.set(result_stud[i].student_id,result_stud[i].pref_8);
                            }
                            else
                            {
                                for(var elem of projects)
                                {
                                    allocation.set(result_stud[i].student_id,elem);
                                    projects.delete(elem);
                                    break;
                                }
                            }
                        }
                        //console.log(allocation);
                        allocation.forEach((value,key) => {
                            //console.log(key+" "+value);
                            sql='update student set allocated_proj_id='+value+' where student_id="'+key+'"';
                            connection.query(sql,(err,result) => {
                                if(err)
                                {
                                    console.log(err);
                                    throw err;
                                }
                                else
                                {
                                    console.log("Project allocated to "+key);
                                }
                            });
                    
                        });
                        res.redirect('admin_home')
                    });
                });
            }
            else
            {
                res.render('allocate_student',{
                    username : req.session.username,
                    message : "Invalid ID."
                })
            }
		});
	}
    else
    {
		res.render('admin_login', {
            message : "Please login first"
        })
	}
});

app.listen('3000', () => {
	console.log('Server started on port 3000.');
});

//sudo kill -9 `sudo lsof -t -i:9001`

