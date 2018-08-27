class Project {
   constructor(id,user,userId,title,desc,history,stats,remix,image) {
      this.id = id ? id : -1,
      this.user = user ? user : "ScratchOnMissingUser";
      this.userId = userId ? userId : -1;
      this.title = title ? title : "";
      this.instructions = desc.instructions ? desc.instructions : "";
      this.noteAndCredits = desc.description ? desc.description : "";
      if(history){
         this.history = {};
         this.history.created = history.created ? scratchOn.fixScratchTimestamp(history.created) : new Date();
         this.history.shared = history.shared ? scratchOn.fixScratchTimestamp(history.shared) : new Date();
         this.history.modified = history.modified ? scratchOn.fixScratchTimestamp(history.modified) : new Date();
      };
      if(stats){
         this.stats = {};
         this.stats.loves = stats.loves ? stats.loves : -1;
         this.stats.favorites = stats.favorites ? stats.favorites : -1;
         this.stats.views = stats.views ? stats.views : -1;
         this.stats.comments = stats.comments ? stats.comments : -1;
         this.stats.remixes = stats.remixes ? stats.remixes : -1;
      };
      if(remix){
         this.remix = {};
         this.remix.isRemix = !!remix.root;
         this.remix.root = remix.root ? remix.root : -1;
         this.remix.direct = remix.parent ? remix.parent : -1;
      };
      this.image = image ? image : "about:blank";
      this.htmlLink = "https://scratch.mit.edu/projects/" + (this.id = id ? id : -1);
      this.endpoint = "/projects/";
   }
   async getAuthor(){
      var that = await scratchOn.scratchGet("/users/",this.user,"","GET");
      return new User(that.id,that.username,that.history,that.profile);
   }
   async getRemixes(offset,limit) {
      return await scratchOn.scratchGetList(false, "project", this.endpoint, this.id, "/remixes?offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40), "GET");
   }
   async getAllRemixes() {
      return await scratchOn.scratchGetList(true, "project", this.endpoint, this.id, "/remixes", "GET");
   }
   async getStudios(offset,limit) {
      return await scratchOn.scratchGetList(false, "studio", this.endpoint, this.id, "/studios?offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40), "GET");
   }
   async getAllStudios() {
      return await scratchOn.scratchGetList(true, "studio", this.endpoint, this.id, "/studios", "GET");
   }
   async lovedFavedBy(user) {
      var lovedInfo = await scratchOn.scratchGet(this.endpoint, this.id, "/loves/user/" + user + "?x-token=" + scratchOn.token, "GET");
      var favedInfo = await scratchOn.scratchGet(this.endpoint, this.id, "/favorites/user/" + user + "?x-token=" + scratchOn.token, "GET");
      if(lovedInfo === "FetchError" || favedInfo === "FetchError"){
         return {loved: false, faved: false};
      };
      return {loved: lovedInfo.userLove,faved: favedInfo.userFavorite};
   }
   async getComments(offset,limit) {
      return await scratchOn.scratchGetList(false, "comment", "/comments/project/", this.id, "?offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40), "GET",{endpoint: "project/",id: this.id});
   }
   async getAllComments() {
      return await scratchOn.scratchGetList(true, "comment", "/comments/project/", this.id, "", "GET",{endpoint: "project/",id: this.id});
   }
   async getCloud(offset,limit){
      var that = await scratchOn.scratchGet("/logs?projectid=",this.id,"&offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40),"GET",true);
      return new ProjectCloudInfo(that,this.id);
   }
   async getAllCloud(){
   var that = await scratchOn.scratchGetAll("/logs?projectid=",this.id,"","GET",true);
   return new ProjectCloudInfo(that,this.id);
}
}
class Studio {
   constructor(id,user,title,desc,history,image,stats) {
      this.id = id ? id : -1,
      this.userId = user ? user : -1;
      this.title = title ? title : "";
      this.desc = desc ? desc : "";
      this.image = image ? image : "about:blank";
      if(history){
         this.history = {};
         this.history.created = history.created ? scratchOn.fixScratchTimestamp(history.created) : new Date();
         this.history.modified = history.modified ? scratchOn.fixScratchTimestamp(history.modified) : new Date();
      };
      this.stats = {};
      this.stats.followers = (stats ? stats.followers : false) ? stats.followers : -1;
      this.htmlLink = "https://scratch.mit.edu/studios/" + (this.id = id ? id : -1);
      this.endpoint = "/studios/";
   }
}
class Comment {
   constructor(id,parent,content,author,history,replies,source) {
      this.source = source;
      this.id = id ? id : -1,
      this.parent = parent ? parent : null;
      this.content = content ? content : "";
      this.isTopLevel = !parent;
      if(author){
         this.userId = author.id ? author.id : -1;
         this.user = author.username ? author.username : "ScratchOnMissingUser";
         this.userImage = author.image ? author.image : "about:blank";
      };
      if(history){
         this.history = {};
         this.history.created = history.created ? scratchOn.fixScratchTimestamp(history.created) : new Date();
         this.history.modified = history.modified ? scratchOn.fixScratchTimestamp(history.modified) : new Date();
      };
      this.replies = replies ? replies : -1;
      this.hasReplies = (replies > 0);
      this.endpoint = "/comments/";
   }
   async getAuthor(){
      var that = await scratchOn.scratchGet("/users/",this.user,"","GET");
      return new User(that.id,that.username,that.history,that.profile);
   }
   async getReplies(offset,limit) {
      return await scratchOn.scratchGetList(false, "comment", this.endpoint + this.source.endpoint, this.source.id + "/" + this.id, "?offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40), "GET",this.source);
   }
   async getAllReplies() {
      return await scratchOn.scratchGetList(true, "comment", this.endpoint + this.source.endpoint, this.source.id + "/" + this.id, "", "GET",this.source);
   }
}
class User {
   constructor(id,username,history,profile) {
      this.id = id ? id : -1,
      this.userId = id ? id : -1;
      this.username = username ? username : "ScratchOnMissingUser";
      if(history){
      this.history = {};
      this.history.joined = (history.joined ? scratchOn.fixScratchTimestamp(history.joined) : new Date());
      };
      if(profile){
         this.profile = {};
         this.profile.images = profile.images ? profile.images : {};
         this.profile.image = profile.images ? (profile.images[Object.keys(profile.images)[0]]) : "about:blank";
         this.status = {};
         this.status.about = profile.bio ? profile.bio : "";
         this.status.workingOn = profile.status ? profile.status : "";
         this.country = profile.country ? profile.country : "Location Not Given";
      };
      this.htmlLink = "https://scratch.mit.edu/users/" + (username ? username : "ScratchOnMissingUser");
      this.endpoint = "/users/";
   }
   async getProjects(offset,limit){
      return await scratchOn.scratchGetList(false, "project", this.endpoint, this.username, "/projects?offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40), "GET");
   }
   async getAllProjects(){
      return await scratchOn.scratchGetList(true, "project", this.endpoint, this.username, "/projects", "GET");
   }
   async getFavorites(offset,limit){
      return await scratchOn.scratchGetList(false, "project", this.endpoint, this.username, "/favorites?offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40), "GET");
   }
   async getAllFavorites(){
      return await scratchOn.scratchGetList(true, "project", this.endpoint, this.username, "/favorites", "GET");
   }
   async getFollowers(offset,limit){
      return await scratchOn.scratchGetList(false, "user", this.endpoint, this.username, "/followers?offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40), "GET");
   }
   async getAllFollowers(offset,limit){
      return await scratchOn.scratchGetList(true, "user", this.endpoint, this.username, "/followers", "GET");
   }
   async getFollowing(offset,limit){
      return await scratchOn.scratchGetList(false, "user", this.endpoint, this.username, "/following?offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40), "GET");
   }
   async getAllFollowing(offset,limit){
      return await scratchOn.scratchGetList(true, "user", this.endpoint, this.username, "/following", "GET");
   }
   async getStudiosFollowing(offset,limit) {
      return await scratchOn.scratchGetList(false, "studio", this.endpoint, this.username, "/studios?offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40), "GET");
   }
   async getAllStudiosFollowing() {
      return await scratchOn.scratchGetList(true, "studio", this.endpoint, this.username, "/studios", "GET");
   }
   async getStudiosCurating(offset,limit) {
      return await scratchOn.scratchGetList(false, "studio", this.endpoint, this.username, "/studios/curate?offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40), "GET");
   }
   async getAllStudiosCurating() {
      return await scratchOn.scratchGetList(true, "studio", this.endpoint, this.username, "/studios/curate", "GET");
   }
}
class Class {
   constructor(id,username,educator,start,end,desc,status,img) {
      this.id = id ? id : -1,
      this.userId = educator.id ? educator.id : -1;
      this.about = desc ? desc : "";
      this.workingOn = status ? status : "";
      this.images = img ? img : {};
      this.image = img ? (img[Object.keys(img)[0]]) : "about:blank";
      if(educator.history){
      this.history = {};
      this.history.educatorJoined = (educator.history.joined ? scratchOn.fixScratchTimestamp(educator.history.joined) : new Date());
      this.history.startDate = (start ? scratchOn.fixScratchTimestamp(start) : new Date());
      this.history.endDate = (end ? scratchOn.fixScratchTimestamp(end) : new Date());
      this.history.hasEnded = !!end;
      };
      if(educator.profile){
         this.profile = {};
         this.profile.images = educator.profile.images ? educator.profile.images : {};
         this.profile.image = educator.profile.images ? (educator.profile.images[Object.keys(educator.profile.images)[0]]) : "about:blank";
         this.status = {};
         this.status.about = educator.profile.bio ? educator.profile.bio : "";
         this.status.workingOn = educator.profile.status ? educator.profile.status : "";
         this.country = educator.profile.country ? educator.profile.country : "Location Not Given";
      };
      this.educator = educator.username ? educator.username : "ScratchOnMissingUser";
      this.htmlLink = "https://scratch.mit.edu/classes/" + (id ? id : -1);
      this.endpoint = "/classrooms/";
   }
   async getEducator(){
      var that = await scratchOn.scratchGet("/users/",this.educator,"","GET");
      return new User(that.id,that.username,that.history,that.profile);
   }
};
class CloudActivityItem {
   constructor(item) {
      this.user = item.user ? item.user : "ScratchOnMissingUser";
      this.isNew = (item.verb ? item.verb : "no_verb") === "create_var";
      this.name = item.name;
      this.value = item.value;
      this.timestamp = (item.timestamp ? scratchOn.fixScratchTimestamp(item.timestamp) : new Date());;
   }
   async getUser(){
      var that = await scratchOn.scratchGet("/users/",this.user,"","GET");
      return new User(that.id,that.username,that.history,that.profile);
   }
}
class ProjectCloudInfo {
   constructor(data,projectId) {
      this.id = projectId ? projectId : -1;
      this.items = data.length;
      this.hasCloudData = data.length > 0;
      this.lastUpdated = (data[0] ? scratchOn.fixScratchTimestamp(data[0].timestamp) : new Date());
      this.activity = [];
      this.vars = [];
      for(var i = 0;i < data.length;i++){
         this.activity.push(new CloudActivityItem(data[i]));
         if(this.vars.indexOf(data[i].name) < 0){
            this.vars.push(data[i].name);
         };
      };
   }
}
var scratchOn = {};
scratchOn.api = "https://api.scratch.mit.edu";
scratchOn.cloudApi = "https://clouddata.scratch.mit.edu";
scratchOn.token = "";
scratchOn.fixScratchTimestamp = function (d){
 var a = d.slice(0,10).split("-");
 return new Date(a[0],(a[1] - 1),a[2]);
}
scratchOn.scratchGet = function (endpoint, id, part, method, isCloud){
   return fetch((isCloud ? scratchOn.cloudApi : scratchOn.api) + endpoint + id + part,{method: method})
      .then(function (r){
         return r.json();
      })
      .catch(function (r){
         return new Promise(function (resolve,reject){
            reject("FetchError");
         });
    });
};
scratchOn.scratchGetAll = async function (endpoint, id, part, method, isCloud){
   var results = [];
   var theseResults = [];
   var offset = 0;
   do {
      theseResults = await scratchOn.scratchGet(endpoint, id, part + ((endpoint + id + part).indexOf("?") > -1 ? "&" : "?") + "offset=" + offset + "&limit=40", method, isCloud);
      results.push(...theseResults);
      offset += 40;
   } while(theseResults.length === 40);
   return results;
}
scratchOn.getProject = async function (id){
   var that = await scratchOn.scratchGet("/projects/",id,"","GET");
   return new Project(that.id,that.author.username,that.author.id,that.title,{instructions: that.instructions,description: that.description},that.history,that.stats,that.remix,that.image);
}
scratchOn.getStudio = async function (id){
   var that = await scratchOn.scratchGet("/studios/",id,"","GET");
   return new Studio(that.id,that.owner,that.title,that.description,that.history,that.image,that.stats);
}
scratchOn.getUser = async function (user){
   var that = await scratchOn.scratchGet("/users/",user,"","GET");
   return new User(that.id,that.username,that.history,that.profile);
}
scratchOn.getClass = async function (id){
   var that = await scratchOn.scratchGet("/classrooms/",id,"","GET");
   return new Class(that.id,that.title,that.educator,that["date_start"],that["date_end"],that.description,that.status,that.images);
}
scratchOn.searchProjects = async function (q,mode,lang,offset,limit){
   var results = await scratchOn.scratchGet("/search/","projects","/?q=" + (q ? q : "") + "&mode=" + (mode ? mode : (q ? "popular" : "trending")) + "&language=" + (lang ? lang : "en") + "&offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 20),"GET");
   if(results === "FetchError"){
      return [];
   };
   var resultList = [];
   for(var i = 0;i < results.length;i++){
      var that = results[i];
      resultList.push(new Project(that.id,((that.author ? that.author.username : false) ? that.author.username : "ScratchOnMissingUser"),((that.author ? that.author.id : false) ? that.author.id : -1),that.title,{instructions: that.instructions,description: that.description},that.history,that.stats,that.remix,that.image));
   };
   return resultList;
};
scratchOn.searchStudios = async function (q,mode,lang,offset,limit){
   var results = await scratchOn.scratchGet("/search/","studios","/?q=" + (q ? q : "") + "&mode=" + (mode ? mode : (q ? "popular" : "trending")) + "&language=" + (lang ? lang : "en") + "&offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 20),"GET");
   if(results === "FetchError"){
      return [];
   };
   var resultList = [];
   for(var i = 0;i < results.length;i++){
      var that = results[i];
      resultList.push(new Studio(that.id,that.owner,that.title,that.description,that.history,that.image,that.stats));
   };
   return resultList;
};
scratchOn.getCloudForProject = async function (id,offset,limit){
   var that = await scratchOn.scratchGet("/logs?projectid=",id,"&offset=" + (offset ? offset : 0) + "&limit=" + (limit ? limit : 40),"GET",true);
   return new ProjectCloudInfo(that,id);
}
scratchOn.getAllCloudForProject = async function (id){
   var that = await scratchOn.scratchGetAll("/logs?projectid=",id,"","GET",true);
   return new ProjectCloudInfo(that,id);
}
scratchOn.scratchGetList = async function (all, type, endpoint, id, part, method, source){
   if(all){
      var things = await scratchOn.scratchGetAll(endpoint, id, part, method);
   }else{
      var things = await scratchOn.scratchGet(endpoint, id, part, method);
   };
   if(things === "FetchError"){
      return [];
   };
   var thingList = [];
   for(var i = 0;i < things.length;i++){
      var that = things[i];
      if(type === "project"){
         thingList.push(new Project(that.id,((that.author ? that.author.username : false) ? that.author.username : "ScratchOnMissingUser"),((that.author ? that.author.id : false) ? that.author.id : -1),that.title,{instructions: that.instructions,description: that.description},that.history,that.stats,that.remix,that.image));
      }else if(type === "studio"){
         thingList.push(new Studio(that.id,that.owner,that.title,that.description,that.history,that.image,that.stats));
      }else if(type === "user"){
         thingList.push(new User(that.id,that.username,that.history,that.profile));
      }else if(type === "comment"){
         thingList.push(new Comment(that.id,that["parent_id"],that.content,that.author,{created: that["datetime_created"],modified: that["datetime_modified"]},that["reply_count"],source));
      };
   };
   return thingList;
}
