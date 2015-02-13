var Code = require('code');
var Lab = require('lab');

var Scheduler = require('../lib/index');

var internals = {
    defaults: {
        dirPath: '/tmp/testfishhook'
    }
};

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.describe;
var it = lab.it;

describe('cron', function () {    

    it('startScheduler empty', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        scheduler.startScheduler();
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('getSchedule invalid', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        var schedule = scheduler.getSchedule('none');
        expect(schedule).to.not.exist();
        done();
    });

    it('stopSchedule empty', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        scheduler.stopSchedule(1);
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('stopScheduler empty', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        scheduler.stopScheduler();
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('startScheduler noschedule', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        var jobs = [{
           id: 1,
           name: 'test'
        }];
        scheduler.startScheduler(jobs);
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        scheduler.stopScheduler();
        done();
    });

    it('startScheduler schedule', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        var jobs = [{
           id: 1,
           name: 'schedule',
           schedule: {
               type: 'cron',
               pattern: '* * * * * *'
           }
        }];
        scheduler.startScheduler(jobs);
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(1);
        done();
    });

    it('getSchedule schedule', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        var schedule = scheduler.getSchedule(1);
        expect(schedule.cronTime.source).to.equal('* * * * * *');
        done();
    });

    it('stopSchedule invalid', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        scheduler.stopSchedule(2);
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(1);
        done();
    });

    it('stopSchedule schedule', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        scheduler.stopSchedule(1);
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('stopScheduler schedule', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        var jobs = [{
           id: 1,
           name: 'schedule',
           schedule: {
               type: 'cron',
               pattern: '* * * * * *'
           }
        }];
        scheduler.startScheduler(jobs);
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(1);
        scheduler.stopScheduler();
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

/*
    it('removeScheduler', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.removeSchedule(jobId);
        var schedules = bait.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('initializeScheduler', function (done) {

        var bait = new Bait(internals.defaults);
        bait.initializeScheduler();
        var schedules = bait.getJobs();
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        //console.log(schedules);
        expect(schedules.length).to.equal(1);
        expect(schedules[0].jobId).to.equal(jobId);
        done();
    });

    it('updateJob', function (done) {

        var config = {
            schedule: {
                type: 'none'
            }
        };
        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        var updateJob = bait.updateJob(jobId, config);
        expect(updateJob.id).to.exist();
        done();
    });

    it('initializeScheduler none', function (done) {

        var bait = new Bait(internals.defaults);
        bait.initializeScheduler();
        var schedules = bait.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('deleteJob', function (done) {

        var bait = new Bait(internals.defaults);
        var jobs = bait.getJobs();
        var jobId = jobs[0].id;
        bait.deleteJob(jobId);
        jobs = bait.getJobs();
        expect(jobs.length).to.equal(0);
        done();
    });
*/
});
