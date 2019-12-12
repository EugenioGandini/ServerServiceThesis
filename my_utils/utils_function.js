exports.parseTextInsertSql = function(text){
    var parsed_text = text.replace("'", "''");
    return parsed_text;
}