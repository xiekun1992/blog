/**
 * Created by silence on 2015/4/28.
 */
var mongoose=require('mongoose');
var categorySchema=mongoose.Schema({
    'name':String
});

var category=mongoose.model('Category',categorySchema);

module.exports=category;