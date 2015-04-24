var Cron = require('cron');

var internals = {
    jobs: []
};

module.exports = internals.FishHook = function (options) {

    this.settings = options;
    this.startScheduler = exports.startScheduler;
    this.stopScheduler = exports.stopScheduler;
    this.startSchedule = exports.startSchedule;
    this.getJobs = exports.getJobs;
    this.getSchedule = exports.getSchedule;
    this.stopSchedule = exports.stopSchedule;
    internals.FishHook.settings = options;
    internals.FishHook.startSchedule = exports.startSchedule;
    internals.FishHook.getSchedule = exports.getSchedule;
    internals.FishHook.getJobs = exports.getJobs;
};

exports.startScheduler = function (jobs) {

    jobs = jobs || [];
    //console.log('initializing scheduler');
    for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].schedule && jobs[i].schedule.type === 'cron' ) {
            internals.FishHook.startSchedule(jobs[i]);
        }
    }
};

exports.stopScheduler = function () {

    console.log('stopping all jobs');
    for (var i = 0; i < internals.jobs.length; i++) {
        internals.jobs[i].schedule.stop();
        internals.jobs.splice(i, 1);
    }
};

exports.getSchedule = function (jobId) {

    for (var i = 0; i < internals.jobs.length; i++) {
        if (internals.jobs[i].jobId === jobId) {
            return internals.jobs[i].schedule;
        }
    }
    return null;
};

exports.getJobs = function () {

    return internals.jobs;
};

exports.stopSchedule = function (jobId) {

    var schedule = internals.FishHook.getSchedule(jobId);
    console.log('stopping schedule for jobId: ' + jobId);
    //console.log(schedule);
    if (schedule) {
        for (var i = 0; i < internals.jobs.length; i++) {
            if (internals.jobs[i].jobId === jobId) {
                internals.jobs.splice(i, 1);
                schedule.stop();
            }
        }
    }
};

exports.startSchedule = function (job) {

    var jobId = job.id;
    console.log('adding schedule job: ' + jobId);
    console.log('scheduling new job for jobId: ' + jobId);
    var schedule = new Cron.CronJob({
        cronTime: job.schedule.pattern,
        //cronTime: "* * * * *",
        onTick: function () {
            //console.log('running jobId: ' + jobId);
            internals.FishHook.settings.startJob(jobId);
        },
        start: true
    });
    internals.jobs.push({ jobId: jobId, schedule: schedule });
    //console.log(internals.jobs);
};
