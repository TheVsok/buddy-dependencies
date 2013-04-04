var path = require('path')
	, fs = require('fs')
	, rimraf = require('rimraf')
	, should = require('should')
	, mv = require('recur-fs').mv
	, dependencies = require('..')
	, Dependency = require('../lib/dependency');

require('buddy-term').silent = true;

describe('dependencies', function() {
	before(function() {
		process.chdir(path.resolve(__dirname, 'fixtures/dependencies'));
	});
	afterEach(function(done) {
		rimraf(path.resolve('libs'), function(err) {
			done();
		});
	});

	describe('Dependency', function() {

		describe('instance', function() {
			it('should set `local` property if `source` exists locally', function() {
				new Dependency('local/lib', '').local.should.be.true;
			});
			it('should set `keep` property if `source` exists locally in `destination`', function() {
				new Dependency('local/lib', '.').keep.should.be.true;
			});
			it('should parse specified `version` number', function() {
				new Dependency('popeindustries/buddy@0.4.0', '').version.should.eql('0.4.0');
			});
			it('should default unspecified `version` number to `master`', function() {
				new Dependency('popeindustries/buddy', '').version.should.eql('master');
			});
			it('should generate a valid github `url`', function() {
				new Dependency('popeindustries/buddy', '').url.should.eql('https://github.com/popeindustries/buddy/archive/master.zip');
			});
			it('should not generate a `url` for a named source', function() {
				should.not.exist(new Dependency('jquery', '').url);
			});
			it('should store specified `resources` in an array', function() {
				var dep = new Dependency('popeindustries/lib#lib/pi/dom|lib/pi/event.js|lib/pi/utils', '');
				dep.resources.should.include('lib/pi/dom');
				dep.resources.should.include('lib/pi/event.js');
				dep.resources.should.include('lib/pi/utils');
			});
		});

		describe('package lookup', function() {
			it('should resolve a valid `url`', function(done) {
				var dependency = new Dependency('backbone', '');
				dependency.lookupPackage(function(err) {
					dependency.url.should.eql('https://github.com/documentcloud/backbone/archive/master.zip');
					done();
				});
			});
			it('should return an error for an invalid package', function(done) {
				var dependency = new Dependency('bunk', '');
				dependency.lookupPackage(function(err) {
					should.exist(err);
					done();
				});
			});
		});

		describe('version validation', function() {
			beforeEach(function() {
				this.dependency = new Dependency('documentcloud/underscore', '');
			});
			afterEach(function() {
				this.dependency = null;
			});
			it('should ignore `1.2.3` as a valid version', function(done) {
				this.dependency.version = '1.2.3';
				this.dependency.validateVersion(function(err) {
					this.dependency.version.should.eql('1.2.3');
					done();
				}.bind(this));
			});
			it('should ignore `master` as a valid version', function(done) {
				this.dependency.version = 'master';
				this.dependency.validateVersion(function(err) {
					this.dependency.version.should.eql('master');
					done();
				}.bind(this));
			});
			it('should set the latest version for `*`', function(done) {
				this.dependency.version = '*';
				this.dependency.validateVersion(function(err) {
					this.dependency.version.should.eql('1.4.4');
					done();
				}.bind(this));
			});
			it('should set the latest version for `latest`', function(done) {
				this.dependency.version = 'latest';
				this.dependency.validateVersion(function(err) {
					this.dependency.version.should.eql('1.4.4');
					done();
				}.bind(this));
			});
			it('should set the highest version that satisfies `>=1.3.2`', function(done) {
				this.dependency.version = '>=1.3.2';
				this.dependency.validateVersion(function(err) {
					this.dependency.version.should.eql('1.4.4');
					done();
				}.bind(this));
			});
			it('should set the highest version that satisfies `>1.3.2`', function(done) {
				this.dependency.version = '>1.3.2';
				this.dependency.validateVersion(function(err) {
					this.dependency.version.should.eql('1.4.4');
					done();
				}.bind(this));
			});
			it('should set the highest version that satisfies `1.3.x`', function(done) {
				this.dependency.version = '1.3.x';
				this.dependency.validateVersion(function(err) {
					this.dependency.version.should.eql('1.3.3');
					done();
				}.bind(this));
			});
			it('should set the highest version that satisfies `1.x`', function(done) {
				this.dependency.version = '1.x';
				this.dependency.validateVersion(function(err) {
					this.dependency.version.should.eql('1.4.4');
					done();
				}.bind(this));
			});
			it('should set the highest version that satisfies `~1.3.2`', function(done) {
				this.dependency.version = '~1.3.2';
				this.dependency.validateVersion(function(err) {
					this.dependency.version.should.eql('1.3.3');
					done();
				}.bind(this));
			});
		});

		describe('remote archive fetching', function() {
			before(function() {
				this.temp = path.resolve('libs');
				if (!fs.existsSync(this.temp)) fs.mkdirSync(this.temp);
			});
			it('should download an archive file to the temp directory', function(done) {
				var dependency = new Dependency('popeindustries/buddy', '', null, this.temp);
				dependency.fetch(function(err) {
					dependency.location.should.eql(path.resolve('libs', 'buddy-master'));
					fs.existsSync(dependency.location).should.be.true;
					done();
				});
			});
			it('should return an error for an invalid url', function(done) {
				var dependency = new Dependency('popeindustries/bunk', '', null, this.temp);
				dependency.fetch(function(err) {
					should.exist(err);
					done();
				});
			});
		});

		describe('resource resolution', function() {
			var dependency;
			it('should resolve resources for package with component.json config file', function(done) {
				dependency = new Dependency('jquery', '');
				dependency.location = path.resolve('archive/jquery-master');
				dependency.resolveResources(function(err, dependencies) {
					dependency.resources.should.include(path.resolve('archive/jquery-master/jquery.js'));
					done();
				});
			});
			it('should resolve resources for package with package.json config file', function(done) {
				dependency = new Dependency('backbone', '');
				dependency.location = path.resolve('archive/backbone-master');
				dependency.resolveResources(function(err, dependencies) {
					dependency.resources.should.include(path.resolve('archive/backbone-master/backbone.js'));
					done();
				});
			});
			it('should resolve resources for package with component.json config file containing `scripts` array', function(done) {
				dependency = new Dependency('domify', '');
				dependency.location = path.resolve('archive/domify-master');
				dependency.resolveResources(function(err, dependencies) {
					dependency.resources.should.have.length(1);
					done();
				});
			});
			it('should rename index.js resources to package {id}.js', function() {
				dependency.resources.should.include(path.resolve('archive/domify-master/domify.js'));
				fs.renameSync(path.resolve('archive/domify-master/domify.js'), path.resolve('archive/domify-master/index.js'));
			});
			it('should store an array of `namethis.version` dependencies', function(done) {
				dependency = new Dependency('backbone', '');
				dependency.location = path.resolve('archive/backbone-master');
				dependency.resolveResources(function(err, dependencies) {
					dependency.dependencies.should.include('underscore@>=1.3.3');
					done();
				});
			});
		});

		describe('moving resources', function() {
			before(function() {
				this.temp = path.resolve('libs');
				this.dependency;
				if (!fs.existsSync(this.temp)) fs.mkdirSync(this.temp);
			});
			it('should move files to `destination`', function(done) {
				this.dependency = new Dependency('backbone', path.resolve('libs'));
				this.dependency.location = path.resolve('archive/backbone-master');
				this.dependency.resources = [path.resolve('archive/backbone-master/backbone.js')];
				this.dependency.move(function(err) {
					fs.existsSync(path.resolve('libs/backbone.js')).should.be.true;
					mv(path.resolve('libs/backbone.js'), path.resolve('archive/backbone-master'), false, function(err) {
						done();
					});
				});
			});
			it('should store references to moved files in `files` property', function() {
				this.dependency.files.should.include('libs' + path.sep + 'backbone.js');
			});
			it('should not move or store references to files when `keep` property is set', function(done) {
				this.dependency = new Dependency(path.resolve('local/lib'), path.resolve('local'));
				this.dependency.move(function(err) {
					this.dependency.files.should.have.length(0);
					done();
				}.bind(this));
			});
		});
	});

	describe('installing a github source', function() {
		it('should install the resource to the given path', function(done) {
			dependencies.install(require(path.resolve('buddy_github.js')).dependencies, function(err, files) {
				fs.existsSync(path.resolve('libs/vendor/require.js')).should.be.true;
				done();
			});
		});
	});

	describe('installing a github source with specified resources', function() {
		it('should install the resources to the given path', function(done) {
			dependencies.install(require(path.resolve('buddy_github_resources.js')).dependencies, function(err, files) {
				fs.existsSync(path.resolve('libs/vendor/pi/event.js')).should.be.true;
				fs.existsSync(path.resolve('libs/vendor/pi/dom')).should.be.true;
				done();
			});
		});
	});

	describe('installing a named source', function() {
		it('should install the resource to the given path', function(done) {
			dependencies.install(require(path.resolve('buddy_name.js')).dependencies, function(err, files) {
				fs.existsSync(path.resolve('libs/vendor/jquery.js')).should.be.true;
				done();
			});
		});
	});

	describe.skip('installing a named source with a dependency', function() {
		it('should install the resources to the given path', function(done) {
			dependencies.install(require(path.resolve('buddy_name_dependant.js')).dependencies, function(err, files) {
				fs.existsSync(path.resolve('libs/vendor/backbone.js')).should.be.true;
				fs.existsSync(path.resolve('libs/vendor/underscore.js')).should.be.true;
				done();
			});
		});
	});

	describe('installing a local source', function() {
		it('should copy the resources to the given path', function(done) {
			dependencies.install(require(path.resolve('buddy_local.js')).dependencies, function(err, files) {
				fs.existsSync(path.resolve('libs/vendor/lib/lib.js')).should.be.true;
				done();
			});
		});
	});

	describe('installing a local source residing in the destination path', function() {
		it('should not be marked for cleanup', function(done) {
			dependencies.install(require(path.resolve('buddy_local_dest.js')).dependencies, function(err, files) {
				files.should.have.length(0);
				done();
			});
		});
	});

	describe('installing sources with a specified output', function() {
		it('should concatenate and compress the resources to the given output path', function(done) {
			dependencies.install(require(path.resolve('buddy_output.js')).dependencies, function(err, files) {
				fs.existsSync(path.resolve('libs/js/libs.js')).should.be.true;
				done();
			});
		});
	});
});
