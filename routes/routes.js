"use strict";

module.exports = function (app) {
  var todologin = require("../user_login/login");
  var todojenkin = require("../src/jenkins-api/jenkinsapi");
  var todogithub = require("../src/github");
  var todocabang = require("../src/ci_cd");

  app.post("/user_login/login", todologin.login);

  app.post("/jenkins/create_pipeline", todojenkin.createPipeline);
  app.post("/jenkins/create_group_job_pipeline", todojenkin.createGroupJobPipeline);
  app.get("/jenkins/get_job", todojenkin.get_job);

  app.get("/github/get_repo", todogithub.get_repo);
  app.post("/github/get_branch", todogithub.get_branch);

  app.post("/ci_cd/get_cabang", todocabang.get_cabang);
  app.get("/ci_cd/get_data_env", todocabang.get_data_env);
  app.get("/ci_cd/create_job", todocabang.create_job);
  app.get("/ci_cd/create_groupjob", todocabang.create_group_job);
};
