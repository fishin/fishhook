'use strict';

const Cron = require('cron');
const Hoek = require('hoek');

const internals = {
    jobs: [],
    defaults: {
        token: null
    }
};

module.exports = internals.FishHook = function (options) {

    const settings = Hoek.applyToDefaults(internals.defaults, options);
    this.settings = settings;
    internals.FishHook.settings = settings;
    this.startScheduler = exports.startScheduler;
    this.stopScheduler = exports.stopScheduler;
    this.startSchedule = exports.startSchedule;
    this.getJobs = exports.getJobs;
    this.getSchedule = exports.getSchedule;
    this.stopSchedule = exports.stopSchedule;
    internals.FishHook.startSchedule = exports.startSchedule;
    internals.FishHook.getSchedule = exports.getSchedule;
    internals.FishHook.getJobs = exports.getJobs;
};

exports.startScheduler = function (jobs) {

    jobs = jobs || [];
    //console.log('initializing scheduler');
    for (let i = 0; i < jobs.length; ++i) {
        if (jobs[i].schedule && jobs[i].schedule.type === 'cron' ) {
            internals.FishHook.startSchedule(jobs[i]);
        }
    }
};

exports.stopScheduler = function () {

    console.log('stopping all jobs');
    for (let i = 0; i < internals.jobs.length; ++i) {
        internals.jobs[i].schedule.stop();
        internals.jobs.splice(i, 1);
    }
};

exports.getSchedule = function (jobId) {

    for (let i = 0; i < internals.jobs.length; ++i) {
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

    const schedule = internals.FishHook.getSchedule(jobId);
    console.log('stopping schedule for jobId: ' + jobId);
    //console.log(schedule);
    if (schedule) {
        for (let i = 0; i < internals.jobs.length; ++i) {
            if (internals.jobs[i].jobId === jobId) {
                internals.jobs.splice(i, 1);
                schedule.stop();
            }
        }
    }
};

exports.startSchedule = function (job) {

    const jobId = job.id;
    console.log('scheduling new job for jobId: ' + jobId);
    const schedule = new Cron.CronJob({
        cronTime: job.schedule.pattern,
        onTick: function () {
            //console.log('running jobId: ' + jobId);
            internals.FishHook.settings.addJob(jobId, null);
            if (job.scm && job.scm.prs) {
                internals.checkJobPRs(jobId, (prs) => {

                    for (let i = 0; i < prs.length; ++i) {
                        internals.FishHook.settings.addJob(jobId, prs[i]);
                    };
                });
            }
        },
        start: true
    });
    internals.jobs.push({ jobId: jobId, schedule: schedule });
    //console.log(internals.jobs);
};

internals.checkJobPRs = function (jobId, cb) {

    const newPRs = [];
    internals.FishHook.settings.getPullRequests(jobId, internals.FishHook.settings.token, (prs) => {

        for (let i = 0; i < prs.length; ++i) {
            const prRuns = internals.FishHook.settings.getRuns(jobId, prs[i]);
            if (prRuns.length === 0) {
                newPRs.push(prs[i]);
            }
        }
        return cb(newPRs);
    });
};
