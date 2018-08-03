var express = require("express");
var router = express.Router({mergeParams: true});
var Blog = require("../models/blog");
var middleware = require("../middleware");

//INDEX ROUTE
router.get("/", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else{
            res.render("index", {allBlogs: blogs, currentUser: req.user});
        }
    }).sort(
        { "_id": -1 }
      )
});

//NEW ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("new" ); 
});

//Archive Route
router.get("/archives", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else{
            res.render("archives", {allBlogs: blogs, currentUser: req.user});
        }
    })
});

//CREATE ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //create blog
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else{
            newBlog.author.id = req.user._id;
            newBlog.author.username = req.user.username;
            newBlog.save();
            
            //redirect to index
            req.flash("success", "Your blog " + newBlog.title + " is successfully added!");
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
//=======================SHOW COMMENT REFERENCE BY POPULATE.EXEC =============
//=======================================================================
router.get("/:id", function(req, res) {
    Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
        if(err){
            console.log(err);
        } else{
            res.render("show", {blog: foundBlog});
        }
    })
})

//EDIT ROUTE
router.get("/:id/edit", middleware.checkOwnershipPost, function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//PUT ROUTE
router.put("/:id", middleware.checkOwnershipPost, function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //Blog.findByIdAndUpdate(id, new data, callback)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            req.flash("success", "Your blog " + updatedBlog.title + " is successfully updated!");
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE ROUTE
router.delete("/:id", middleware.checkOwnershipPost, function(req, res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else{
            //redirect
            res.redirect("/blogs");
        }
    });
});


module.exports = router;