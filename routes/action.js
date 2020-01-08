var express = require('express');
var router = express.Router();
const db = require('../module/pool');
const options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//uid(새로 무작위로 생성한 id) == shortUrl

// id 생성
const uid = () => {
    var id="";
    // length of ID : 0 ~ 8
    var length = Math.floor(Math.random() * 8) + 1;
    for(var i=0; i<length; i++) {
        id += options.charAt(Math.floor(Math.random() * 62));
    }
    return id;
};

// before 검증 및 생성
const create = async (before, after) => {
    try {
        const getUrlQuery = 'SELECT shortUrl FROM `check` WHERE longUrl = ?';
        const getUrlResult = await db.queryParam_Parse(getUrlQuery, [before]);
        console.log(getUrlResult);
        if(getUrlResult.length == 0) {
            var res = await check(before, after);

            //중복시 중복되지 않은 새로운 shortUrl을 생성해서 리턴한다.
            return res;
        }
        return getUrlResult[0]['shortUrl'];

    } catch (err) {
        console.log(err);
        // gMsg = "에러가 발생했습니다. 다시 시도해주세요.";
        return null;
    }
}
  
// before가 이미 검증된 경우(처음 저장하는 경우), id만 중복 여부 검증
const check = async (before, after) => {
    try {
        const getIDQuery = 'SELECT shortUrl FROM `check` WHERE longUrl = ?';
        const getIDResult = await db.queryParam_Parse(getIDQuery, [before]);

        if(getIDResult.length == 0) {
            const insertIDQuery = 'INSERT INTO `check` (longUrl, shortUrl) VALUES (?, ?)';
            const insertIDResult = await db.queryParam_Parse(insertIDQuery, [before, after]);
            if(insertIDResult.length == 0){
                console.log("inserID 실패");
            }else{
                return after;
            }
        }
        //또 다시 uid==shortUrl을 만든다.--> 다른 db에 없는 shortUrl이 생성될때까지 돌린다.
        check(before, uid());            
    } catch (err) {
        console.log(err);
        gMsg = "에러가 발생했습니다. 다시 시도해주세요.";
        return null;
    }
}

//GET => 단축을 웹에 띄워주는 과정
router.get('/:web', async(req, res)=>{
    try{
        const web = req.params.web;

        const getLongQuery = 'SELECT longUrl FROM `check` WHERE shortUrl = ?';
        const getLongResult = await db.queryParam_Parse(getLongQuery, [web]);

        if(getLongResult.length == 0){
            console.log("DB에서 찾을 수 없음");
            return;
        }else{
            res.redirect(getLongResult[0]['longUrl']);
            return;            
        }
    }catch(err){
        console.log(err);
        console.log("ERROR");
        res.send(500);
    }
});

//POST => URL 체크 후 존재하면 그대로 리턴, 없으면 생성하여 리턴
router.post('/create/url', async(req, res)=>{
    var long_url = req.body.before;  

    //'http://'를 붙이지 않았을 경우 처리
    if (!long_url.match(/^[a-zA-Z]+:\/\//)){
        long_url = 'http://' + long_url;
    }
  
    var short_url = uid();//id생성
    gMsg="";

    var status = await create(long_url, short_url);
    gMsg += status;
  
    if (status) {
        console.log("최종 메세지 : " + gMsg);
        res.send({data: status, msg: gMsg});
    } else {
        console.log("최종 메세지 : " + gMsg);
        res.send({status: 500, msg: "DB Error"});
    }
});

module.exports = router;