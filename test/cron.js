'use strict';

const Code = require('code');
const Lab = require('lab');

const Scheduler = require('../lib/index');

const internals = {
    defaults: {
        dirPath: '/tmp/testfishhook',
        tacklebox: {
            job: {
                dirPath: '/tmp/testfishhook/job'
            }
        }
    }
};

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

describe('cron', () => {

    it('startScheduler empty', (done) => {

        const scheduler = new Scheduler(internals.defaults);
        scheduler.startScheduler();
        const schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('getSchedule invalid', (done) => {

        const scheduler = new Scheduler(internals.defaults);
        const schedule = scheduler.getSchedule('none');
        expect(schedule).to.not.exist();
        done();
    });

    it('stopSchedule empty', (done) => {

        const scheduler = new Scheduler(internals.defaults);
        scheduler.stopSchedule(1);
        const schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('stopScheduler empty', (done) => {

        const scheduler = new Scheduler(internals.defaults);
        scheduler.stopScheduler();
        const schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('startScheduler noschedule', (done) => {

        const scheduler = new Scheduler(internals.defaults);
        const jobs = [{
            id: 1,
            name: 'test'
        }];
        scheduler.startScheduler(jobs);
        const schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        scheduler.stopScheduler();
        done();
    });

    it('startScheduler schedule', (done) => {

        const scheduler = new Scheduler(internals.defaults);
        const jobs = [
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
        const schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(2);
        done();
    });

    it('getSchedule schedule', (done) => {

        const scheduler = new Scheduler(internals.defaults);
        const schedule = scheduler.getSchedule(1);
        expect(schedule.cronTime.source).to.equal('* * * * * *');
        done();
    });

    it('stopSchedule invalid', (done) => {

        const scheduler = new Scheduler(internals.defaults);
        scheduler.stopSchedule(3);
        const schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(2);
        done();
    });

    it('stopSchedule schedule', (done) => {

        const scheduler = new Scheduler(internals.defaults);
        let schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(2);
        scheduler.stopSchedule(2);
        schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(1);
        scheduler.stopSchedule(1);
        schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('stopScheduler schedule', (done) => {

        const scheduler = new Scheduler(internals.defaults);
        const jobs = [{
            id: 1,
            name: 'schedule',
            schedule: {
                type: 'cron',
                pattern: '* * * * * *'
            }
        }];
        scheduler.startScheduler(jobs);
        let schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(1);
        scheduler.stopScheduler();
        schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(0);
        done();
    });

    it('startSchedule addJob noprs', (done) => {

        internals.defaults = {
            addJob: function (jobId, pr) {

                console.log('simulating addJob for ' + jobId);
            },
            getPullRequests: function (jobId, callback) {

                return callback([]);
            }
        };
        const scheduler = new Scheduler(internals.defaults);
        const jobs = [{
            id: 1,
            name: 'schedule',
            schedule: {
                type: 'cron',
                pattern: '* * * * * *'
            }
        }];
        scheduler.startScheduler(jobs);
        let schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(1);
        const intervalObj = setInterval(() => {

            const log = console.log;
            console.log = function (value) {

                clearInterval(intervalObj);
                console.log = log;
                expect(value).to.equal('simulating addJob for 1');
                scheduler.stopScheduler();
                schedules = scheduler.getJobs();
                expect(schedules.length).to.equal(0);
                done();
            };
        }, 1000);
    });

    it('startSchedule addJob prs noruns', (done) => {

        const prs = [
            {
                number: 1
            }
        ];
        internals.defaults = {
            addJob: function (jobId, pr) {

                console.log('simulating addJob for ' + jobId);
            },
            getPullRequests: function (jobId, token, callback) {

                return callback(prs);
            },
            getRuns: function (jobId, pr) {

                return [];
            }
        };
        const scheduler = new Scheduler(internals.defaults);
        const jobs = [{
            id: 1,
            name: 'schedule',
            scm: {
                prs: true
            },
            schedule: {
                type: 'cron',
                pattern: '* * * * * *'
            }
        }];
        scheduler.startScheduler(jobs);
        let schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(1);
        const intervalObj2 = setInterval(() => {

            const log = console.log;
            console.log = function (value) {

                clearInterval(intervalObj2);
                console.log = log;
                expect(value).to.equal('simulating addJob for 1');
                scheduler.stopScheduler();
                schedules = scheduler.getJobs();
                expect(schedules.length).to.equal(0);
                done();
            };
        }, 1000);
    });

    it('startSchedule addJob prs run', (done) => {

        const prs = [
            {
                number: 1
            }
        ];
        internals.defaults = {
            addJob: function (jobId, pr) {

                console.log('simulating addJob for ' + jobId);
            },
            getPullRequests: function (jobId, token, callback) {

                return callback(prs);
            },
            getRuns: function (jobId, pr) {

                return [{ runId: 1 }];
            }
        };
        const scheduler = new Scheduler(internals.defaults);
        const jobs = [{
            id: 1,
            name: 'schedule',
            scm: {
                prs: true
            },
            schedule: {
                type: 'cron',
                pattern: '* * * * * *'
            }
        }];
        scheduler.startScheduler(jobs);
        let schedules = scheduler.getJobs();
        expect(schedules.length).to.equal(1);
        const intervalObj3 = setInterval(() => {

            const log = console.log;
            console.log = function (value) {

                clearInterval(intervalObj3);
                console.log = log;
                scheduler.stopScheduler();
                schedules = scheduler.getJobs();
                expect(schedules.length).to.equal(0);
                done();
            };
        }, 1000);
    });
});
