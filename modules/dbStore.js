var mysql = require('mysql');
var pool  = mysql.createPool({
 connectionLimit : 3,
 host : "us-cdbr-sl-dfw-01.cleardb.net",
 user : "bb310e6a24f67c",
 password : "57d49e0d",
 database : "ibmx_c400ab2505a7b43"
});


	 
module.exports.getBalance = function(accountNumber,callback) {
    console.log("DBStore : Account number is ",accountNumber);
 
    pool.getConnection(function(err, connection) {
        connection.query('SELECT balance from accountdetails where accountNumber= ?',[accountNumber], function(err,result){
            if(err) throw err;
                //console.log(result[0].balance);     
				
        connection.release();
        callback(null,result);     						

     });   
    
    
    });
   
     
}