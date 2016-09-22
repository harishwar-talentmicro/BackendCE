/**
 * Created by Hirecraft on 24-08-2016.
 */
var DealCtrl = {};

/**
 *
 * @param req
 * @param res
 * @param next
 */
DealCtrl.saveDeal = function(req,res,next){
    var response = {
        status : false,
        message : "Invalid token",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            req.body.dealEnable = (req.body.dealEnable) ? req.body.dealEnable : 1;
            req.body.dealTitle = (req.body.dealTitle) ? req.body.dealTitle : '';
            req.body.dealDescription = (req.body.dealDescription) ? req.body.dealDescription : '';
            req.body.dealKeyword = (req.body.dealKeyword) ? req.body.dealKeyword : '';
            var procParams = [
                req.st.db.escape(req.query.token),req.st.db.escape(req.body.dealEnable),
                req.st.db.escape(req.body.dealTitle),req.st.db.escape(req.body.dealDescription),
                req.st.db.escape(req.body.dealKeyword)
            ];
            /**
             * Calling procedure to save deal
             * @type {string}
             */
            var procQuery = 'CALL pupdate_deal_details( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,dealResult){
                if(!err && dealResult && dealResult[0] && dealResult[0][0] && dealResult[0][0].id){
                    response.status = true;
                    response.message = "Deal saved successfully";
                    response.error = null;
                    response.data = {
                        dealEnable : (req.body.dealEnable) ? req.body.dealEnable : 1,
                        dealTitle : (req.body.dealTitle) ? req.body.dealTitle : '',
                        dealDescription : (req.body.dealDescription) ? req.body.dealDescription : '',
                        dealKeyword : (req.body.dealKeyword) ? req.body.dealKeyword : ''
                    }
                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while saving deal";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);
        }
    });
};

/**
 *
 * @param req
 * @param res
 * @param next
 */
DealCtrl.getDeal = function(req,res,next){
    var response = {
        status : false,
        message : "Error while loading deal",
        data : null,
        error : null
    };

    req.st.validateToken(req.query.token,function(err,tokenResult){
        if((!err) && tokenResult){

            var procParams = [
                req.st.db.escape(req.query.token)
            ];
            /**
             * Calling procedure to get deal
             * @type {string}
             */
            var procQuery = 'CALL pget_deal_details( ' + procParams.join(',') + ')';
            console.log(procQuery);
            req.db.query(procQuery,function(err,dealResult){
                if(!err && dealResult && dealResult[0] && dealResult[0][0]){
                    response.status = true;
                    response.message = "Deal details loaded successfully";
                    response.error = null;
                    response.data = dealResult[0][0];
                    res.status(200).json(response);

                }
                else{
                    response.status = false;
                    response.message = "Error while getting deal";
                    response.error = null;
                    response.data = null;
                    res.status(500).json(response);
                }
            });
        }
        else{
            res.status(401).json(response);
        }
    });
};

module.exports = DealCtrl;