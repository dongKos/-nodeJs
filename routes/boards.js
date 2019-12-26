var express = require('express');
var router = express.Router();
var mysql = require('mysql'); //mysql 모듈을 로딩.
/*
 로딩된 mysql 객체로부터 커넥션을 하나 생성합니다. 이때 실제적인 DB와의 연결은 이루어지지 않습니다.
 이후 query문이 실행될 때 이 커넥션을 통해 DB와 연결됩니다.
 */
var connection = mysql.createConnection({
  host: 'localhost', // DB가 위치한 IP주소
  port: 3306,          // DB와 연결할 포트번호
  user: 'root',        // 계정이름
  password: 'root',    // 계정 비밀번호
  database: 'board'    // 데이터베이스 이름
});

	/* GET List Page. */
	router.get('/',function (req,res,next) {
		//res.render('response board!');
	  res.redirect('/boards/list/1')// /board로 접속요청이 들어왔을 때 1페이지로 자동으로 이동하도록 리다이렉트 해줍니다.
	});
	
	router.get('/list/:page', function(req, res, next) {
	
	  var query = connection.query('SELECT * FROM BOARD',function(err,rows){
	    if(err) console.log(err)        // 만약 에러값이 존재한다면 로그에 표시합니다.
	    console.log('rows :' +  rows);
	    console.log('rows.length' + rows.length);
	    res.render('list', { title:'Board List',rows: rows }); // view 디렉토리에 있는 list 파일로 이동합니다.
	  });
	});
	
	router.get('/write', function(req, res, next) {
		//if(err) console.log(err);
		res.render('write', {title: '게시글 작성!'});
	});
	
	router.post('/write', function(req, res, next) {
		var bTitle = req.body.bTitle;
		var bWriter = req.body.bWriter;
		var bContent = req.body.bContent;
		console.log(req.body);
		connection.query('INSERT INTO BOARD(BTITLE, BWRITER, BCONTENT) VALUES(?, ?, ?)', [bTitle, bWriter, bContent], 
				function(err) {
					if(err) {
						console.log(err);
						connection.rollback(function() {
							console.error('rollback Point!');
						});
					} else {
						connection.commit(function(err) {
							if(err) console.log(err);
							connection.query('SELECT * FROM BOARD',function(err,rows){
							    if(err) console.log(err)        
							    res.render('list', { title:'Board List',rows: rows });
							  });
						})
					}
		});
	});
	
	router.get('/read/:bno', function(req, res, next) {
		var bno = req.params.bno;
		console.log("bno : " + bno);
		
		connection.beginTransaction(function(err) {
			if(err) console.log(err);
			connection.query('UPDATE BOARD SET CLICK_CNT = CLICK_CNT + 1 WHERE BNO=?', [bno], function(err) {
				if(err) {
					console.log(err);
					connection.rollback(function() {
						console.error('rollback point!');
					})
				}
				connection.query('SELECT * FROM BOARD WHERE BNO=?', [bno], function(err, rows) {
					if(err) {
						console.log(err);
						connection.rollback(function() {
							console.error("rollback point2!");
						})
					} else {
						connection.commit(function(err) {
							if(err) console.log(err);
							res.render('read', {title: rows[0].BTITLE, rows: rows});
						})
					}
				})
			})
		})
	});
	
	router.post('/update', function(req, res, next) {
			var bno = req.body.bno;
			var bTitle = req.body.bTitle;
			var bContent = req.body.bContent;
			console.log(req.body);
			
			connection.query('UPDATE BOARD SET BTITLE = ? , BCONTENT = ? WHERE BNO = ?', [bTitle, bContent, bno], function(err, result) {
				if(err) console.log(err);
				else {
					console.log("result : " + result);
					res.redirect("/boards");
				}
			})
	});
	
	router.get('/delete/:bno', function(req, res, next) {
		var bno = req.params.bno;
		console.log("bno : " + bno);
		
		connection.query('DELETE FROM BOARD WHERE BNO = ?', [bno], function(err) {
			if(err) {
				console.log(err);
				connection.rollback(function(err) {
					if(err) console.log(err); 
				})
			} else {
				connection.query('SELECT * FROM BOARD',function(err,rows){
				    if(err) console.log(err)        
				    res.render('list', { title:'Board List',rows: rows });
				  });
			}
		})
	});
	
	module.exports = router;




















