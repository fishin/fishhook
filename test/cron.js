var Code = require('code');
var Lab = require('lab');

var Scheduler = require('../lib/index');

var internals = {
    defaults: {
        dirPath: '/tmp/testfishhook',
        tacklebox: {
            job: {
                dirPath: '/tmp/testfishhook/job'
            }
        }
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
        var jobs = [
            {
                id: 1,
                name: 'schedule',
                schedule: {
                    type: 'cron',
                    pattern: '* * * * * *'
                }
            },
            {
                id: 2,
                name: 'schedule',
                schedule: {
                    type: 'cron',
                    pattern: '* * * * * *'
                }
            }
        ];
        scheduler.startScheduler(jobs);
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(2);
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
        scheduler.stopSchedule(3);
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(2);
        done();
    });

    it('stopSchedule schedule', function (done) {

        var scheduler = new Scheduler(internals.defaults);
        var schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(2);
        scheduler.stopSchedule(2);
        schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(1);
        scheduler.stopSchedule(1);
        schedules = scheduler.getJobs();
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
        schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('startSchedule startJob noprs', function (done) {

        internals.defaults = {
            startJob: function (jobId) {

                console.log('simulating startJob for ' + jobId);
            },
            getPullRequests: function (jobId, token, callback) {

                return callback([]);
            }
        };
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
        var intervalObj = setInterval(function () {

            var log = console.log;
            console.log = function (value) {

                clearInterval(intervalObj);
                console.log = log;
                expect(value).to.equal('simulating startJob for 1');
                scheduler.stopScheduler();
                schedules = scheduler.getJobs();
                expect(schedules.length).to.equal(0);
                done();
            };
        }, 1000);
    });

    it('startSchedule startJob prs noruns', function (done) {

        internals.defaults = {
            startJob: function (jobId) {

                console.log('simulating startJob for ' + jobId);
            },
            getPullRequests: function (jobId, token, callback) {

                return callback([{ number: 1 }]);
            },
            getRuns: function (jobId, pr) {

                return [];
            }
        };
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
        var intervalObj2 = setInterval(function () {

            var log = console.log;
            console.log = function (value) {

                clearInterval(intervalObj2);
                console.log = log;
                expect(value).to.equal('simulating startJob for 1');
                scheduler.stopScheduler();
                schedules = scheduler.getJobs();
                expect(schedules.length).to.equal(0);
                done();
            };
        }, 1000);
    });

    it('startSchedule startJob prs run', function (done) {

        internals.defaults = {
            startJob: function (jobId) {

                console.log('simulating startJob for ' + jobId);
            },
            getPullRequests: function (jobId, token, callback) {

                return callback([{ number: 1 }]);
            },
            getRuns: function (jobId, pr) {

                return [{ runId: 1 }];
            }
        };
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
        var intervalObj3 = setInterval(function () {

            var log = console.log;
            console.log = function (value) {

                clearInterval(intervalObj3);
                console.log = log;
                expect(value).to.equal('simulating startJob for 1');
                scheduler.stopScheduler();
                schedules = scheduler.getJobs();
                expect(schedules.length).to.equal(0);
                done();
            };
        }, 1000);
    });
});
