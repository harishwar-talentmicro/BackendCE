/**
 * @todo FnGetAlarmMessages
 * Method : Get
 * @param req
 * @param res
 * @param next
 * @description api code for send notifications messages
 */
function FnGetAlarmMessages(){
    try
    {
        var _this = this;

        var responseMessage = {
            status: false,
            error: {},
            message: '',
            data: null
        };
        var query = 'CALL pGetAlarmMessages()';
        st.db.query(query, function (err, getResult) {
            console.log(getResult);
            if (!err) {
                if (getResult) {
                    if (getResult[0].length > 0) {
                        responseMessage.status = true;
                        responseMessage.error = null;
                        responseMessage.message = 'Alarm Messages loaded successfully';
                        responseMessage.data = getResult[0];
                        res.status(200).json(responseMessage);
                        console.log('FnGetAlarmMessages: Alarm Messages loaded successfully');
                    }
                    else {
                        responseMessage.message = 'Alarm Messages not loaded';
                        res.status(200).json(responseMessage);
                        console.log('FnGetAlarmMessages:Alarm Messages not loaded');
                    }
                }
                else {
                    responseMessage.message = 'Alarm Messages not loaded';
                    res.status(200).json(responseMessage);
                    console.log('FnGetAlarmMessages:Alarm Messages not loaded');
                }
            }
            else {
                responseMessage.message = 'An error occured ! Please try again';
                responseMessage.error = {
                    server: 'Internal Server Error'
                };
                res.status(500).json(responseMessage);
                console.log('FnGetAlarmMessages: error in getting Alarm Messages:' + err);
            }
        });
    }
    catch (ex) {
        responseMessage.error = {
            server: 'Internal Server Error'
        };
        responseMessage.message = 'An error occurred !';
        res.status(500).json(responseMessage);
        console.log('Error : FnGetAlarmMessages ' + ex.description);
        var errorDate = new Date();
        console.log(errorDate.toTimeString() + ' ......... error ...........');
    }
};