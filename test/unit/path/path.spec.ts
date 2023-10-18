import PathMatcher, { _test, RouteConfig } from '../../../src/util/path.js';
import { expect } from 'chai';
import { planEach, wrapErrCtx } from '../support/test-utils.js';
import colors from 'colors';

let { mapLookaheads, mapWildcards } = _test;


describe('Utils - path', function () {

  describe.skip('pattern transforms - mapLookaheads', function () {
    it('should map negative-lookaheads to sub-regex', function () {
      let result = mapLookaheads('/a/:b/:c(?!d|e|f)');
      let expected = '/a/:b/:c((?!d|e|f)[a-z]+)';
      expect(result).to.eq(expected);
    });

    it('should support multiple groups', function () {
      let result = mapLookaheads('/a/:b/:c(?!d|e|f)/:g(?!h|i|j)');
      let expected = '/a/:b/:c((?!d|e|f)[a-z]+)/:g((?!h|i|j)[a-z]+)'
      expect(result).to.eq(expected);
    });
  })

  describe('pattern transforms - mapWildcards', function () {
    it('should map free wildcards to unnamed parameters', function () {
        let result = mapWildcards('/a/:b/:c/*/d/*');
        let expected = '/a/:b/:c/(.*)/d/(.*)'
        expect(result).to.eq(expected);
    });
  });

  describe('PatMatcher #addRoute', function () {
    it('should add routes to routing config with associated data', function (done) {
      let p = new PathMatcher();

      p.addRoute('/home', { name: 'home-view' });
      p.addRoute('/user/:userId', { name: 'user-view' });

      expect(p.config).to.be.a('array', 'expected route config to be array');
      expect(p.config).to.have.length(2, 'expected 2 routes in route config');

      wrapErrCtx(this, p.config, done, () => {
          expect(p.config[0]).to.have.property('pattern', '/home');
          expect(p.config[0]).to.have.property('mapped', '/home');
          expect(p.config[0]).to.have.property('data')
            .that.deep.eq({ name: 'home-view' });

          expect(p.config[1]).to.have.property('pattern', '/user/:userId');
          expect(p.config[1]).to.have.property('mapped', '/user/:userId');
          expect(p.config[1]).to.have.property('data')
            .that.deep.eq({ name: 'user-view' });
      })


    });
  })

  describe('PathMatcher #pathIs, #pathIsNot', function () {
    const testPatternA = '/users/:id/:tab(home|photos|bio)';
    const shouldMatchA = [
      '/users/abc123/home',
      '/users/xyz987/photos',
      '/users/def567/bio',
    ];

    const testPatternB = '/users/:id/:tab(?!home|photos|bio)'
    const shouldMatchB = [
      '/users/abc123/friends',
      '/users/xyz987/contact'
    ];

    const shouldNotMatchAny = [
      '/totally/different/path'
    ]

    const p = new PathMatcher();
    p.addRoute(testPatternA);
    p.addRoute(testPatternB);

    const expectedMatch = (pattern, path) => {
      return `Expected a match for path "${path}" with pattern "${pattern}"`;
    }

    const expectedNoMatch = (pattern, path) => {
      return `Expected a non-match for path "${path}" with pattern "${pattern}"`;
    }

    const assertPathIs = (p: PathMatcher, pattern: string, value: string) => {
      expect(p.pathIs(pattern))
        .to.equal(true, expectedMatch(pattern, value));
      expect(p.pathIsNot(pattern))
        .to.equal(false, expectedNoMatch(pattern, value));
    }

    const assertPathIsNot = (p: PathMatcher, pattern: string, value: string) => {
      expect(p.pathIs(pattern))
        .to.equal(false, expectedNoMatch(pattern, value));
      expect(p.pathIsNot(pattern))
        .to.equal(true, expectedMatch(pattern, value));
    }

    it('should match when "tab" param is one of the allowed values', function () {

      planEach(shouldMatchA.length, shouldMatchA, (tCase) => {
        p.setLocation(tCase);
        assertPathIs(p, testPatternA, tCase);
      });

      planEach(shouldMatchB.length, shouldMatchB, (tCase) => {
        p.setLocation(tCase);
        assertPathIsNot(p, testPatternA, tCase);
      });

      planEach(shouldNotMatchAny.length, shouldNotMatchAny, (tCase) => {
        p.setLocation(tCase);
        assertPathIsNot(p, testPatternA, tCase);
      });
    });

    it('should not match when "tab" param differs from allowed', function () {

      planEach(shouldMatchA.length, shouldMatchA, (tCase) => {
        p.setLocation(tCase);
        assertPathIsNot(p, testPatternB, tCase);
      });

      planEach(shouldMatchB.length, shouldMatchB, (tCase) => {
        p.setLocation(tCase);
        assertPathIs(p, testPatternB, tCase);
      });

      planEach(shouldNotMatchAny.length, shouldNotMatchAny, (tCase) => {
        p.setLocation(tCase);
        assertPathIsNot(p, testPatternB, tCase);
      });
    });
  });

  describe('PathMatcher #paramMatches', function () {
    it('should return true when a path param equals a given value', function () {
      let pattern = '/users/:userId/friends/:friendId/*'
      let userId = 'qwerty123';
      let friendId = 'mnbvcx456';

      let p = new PathMatcher();
      p.addRoute(pattern);
      p.setLocation(`/users/${userId}/friends/${friendId}/willthisworkto`);

      expect(p.pathIs(pattern)).to.eq(true, 'Test location URL does not match the pattern');

      expect(p.paramMatches(pattern, 'userId', userId)).to.eq(true,
        'Expected userId to be qwerty123');

      expect(p.paramMatches(pattern, 'friendId', friendId)).to.eq(true,
        'Expected friendId to be mnbvcx456');
    });
  });

  describe('PathMatcher #exact', function () {
    it('should only return true if current path matches exactly', function () {

    });
  });

  describe('PathMatcher #findMatch', function () {



  })

  describe('Functional Tests', function () {
    describe('test patterns', function () {

      const setupMatchers = (pattern: string, name: string) => {
        let p = new PathMatcher();
        p.addRoute(pattern, { name });

        return {
          config: p.config,
          match: (path: string) => {
            expect(p.exec(pattern, path), `Expected non-null result "${path}"`).to.exist
              .and.have.property('isMatch', true, `Expected match for "${path}"`);
          },
          noMatch: (path: string) => {
            expect(p.exec(pattern, path), `Expected non-null result "${path}"`).to.exist
              .and.have.property('isMatch', false, `Expected non-match for "${path}"`);
          }
        }
      };

      it('should support parameter negation', function (done) {
        let pattern = '/:foo/:bar(!secret)';
        let { match, noMatch, config } = setupMatchers(pattern, this.test.title);

        wrapErrCtx(this, config, done, () => {
          match('/thisIsOK/OK');
          noMatch('/thisIsNotOK/secret');
        });
      });

      it('should support parameter negation in middle path', function (done) {
        let pattern = '/:foo/:bar(!secret)/:baz';
        let { match, noMatch, config } = setupMatchers(pattern, this.test.title);

        wrapErrCtx(this, config, done, () => {
          noMatch('/thisIsNotOK/OK');
          match('/thisIsOK/OK/OK');
          noMatch('/thisIsNotOK/secret');
          noMatch('/thisIsNotOK/secret/OK');
        });
      });

      it('should support parameter negation in middle path and succeeding optional params', function (done) {
        let pattern = '/:foo/:bar(!secret)/:baz?';
        let { match, noMatch, config } = setupMatchers(pattern, this.test.title);

        wrapErrCtx(this, config, done, () => {
          match('/thisIsOK/OK');
          match('/thisIsOK/OK/OK');
          noMatch('/thisIsNotOK/secret');
          noMatch('/thisIsNotOK/secret/OK');
        });
      });

      it('should support optional parameter negation', function (done) {
        let pattern = '/:foo/:bar(!secret)?';
        let { match, noMatch, config } = setupMatchers(pattern, this.test.title);

        wrapErrCtx(this, config, done, () => {
          match('/thisIsOK');
          match('/thisIsOK/');
          match('/thisIsOK/OK');
          noMatch('/thisIsNotOK/secret');
        });
      });

      it('should support optional parameter negation preceded by optional parameter', function (done) {
        let pattern = '/:foo/:bar?/:baz(!secret)?';
        let { match, noMatch, config } = setupMatchers(pattern, this.test.title);

        wrapErrCtx(this, config, done, () => {
          match('/thisIsOK');
          match('/thisIsOK/');
          match('/thisIsOK/OK');
          match('/thisIsOK/OK/OK');
          noMatch('/thisIsNotOK/OK/secret');
        });
      });

      it('should not support optional parameter negation in middle path', function () {
        let pattern = '/:foo/:bar(!secret)?/:baz?';

        // todo - test cases if ever negated inner optional is supported
        // let { match, noMatch, config } = setupMatchers(pattern, this.test.title);
        // wrapErrCtx(this, config, done, () => {
        //   match('/thisIsOK');
        //   match('/thisIsOK/');
        //   match('/thisIsOK/OK');
        //   match('/thisIsOK/OK/OK');
        //   noMatch('/thisIsNotOK/secret');
        //   noMatch('/thisIsNotOK/secret/');
        //   noMatch('/thisIsNotOK/secret/sauce');
        //   noMatch('/thisIsNotOK/secret/sauce/is/ketchup');
        // });

        expect(function () {
          let p = new PathMatcher();
          p.addRoute(pattern);
        }).to.throw(Error, 'Inner negated optional params not supported');
      });
    });

    describe('all use cases', function () {

      it('does all the things', function () {

        let p = new PathMatcher();

        type Bar = {
          bar: string
        }

        type Baz = {
          baz: string;
        }

        type BarBaz = Bar & Baz;

        type NamedRoute = {
          name: string;
        }

        type Flavored = {
          flavor: 'vanilla' | 'chocolate' | 'soy';
        }

        type FlavoredRoute = {
          originalFlavor: Flavored["flavor"];
        }

        let justFooRoute = p.addRoute<NamedRoute>('/foo', {
          name: 'just-foo'
        });

        let fooSplatRoute = p.addRoute<NamedRoute>('/:foo*', {
          name: 'foo-splat'
        });

        let fooWildRoute = p.addRoute<NamedRoute>('/foo/*', {
          name: 'foo-wild'
        });

        p.addRoute<NamedRoute, Bar>('/foo/:bar?', {
          name: 'foo-bar?'
        });

        p.addRoute<NamedRoute, Bar>('/foo/:bar*', {
          name: 'foo-bar-splat'
        });

        let fooBarBazRoute = p.addRoute<NamedRoute, BarBaz>('/foo/:bar/:baz', {
          name: 'foo-bar-baz'
        });

        p.addRoute<NamedRoute, BarBaz>('/foo/:bar?/:baz?', {
          name: 'foo-bar?-baz?'
        });

        p.addRoute<NamedRoute, BarBaz>('/foo/:bar/:baz/*', {
          name: 'foo-bar-baz-wild'
        });

        let soyRoute = p.addRoute<FlavoredRoute, Flavored>('/qux/:flavor?', {
          originalFlavor: 'soy'
        });

        // -------- Functions to show current state ----------

        const isRouteActive = (name: string, pattern: string) => {
          let prefix = `${name}`.magenta;

          if (p.pathIs(pattern)) {
            console.log(prefix, `${name} matches current location!`.green, `(${p.location})`);
          }
          if (p.pathIsNot(pattern)) {
            console.log(prefix, `${name} does not match current location`.red, `(${p.location})`);
          }

          console.log(prefix, `${name} consumer has this data available:`);

          let { path, route, params } = p.bestMatch();

          console.log(prefix, '→ Current route:', route.pattern);
          console.log(prefix, '→ Current route data (untyped):', route.data);
          console.log(prefix, '→ Current path:', path);
          console.log(prefix, '→ Current params:', params);
        }

        const isTypedRouteActive = (name: string, anyBarBazRoute: RouteConfig<NamedRoute, BarBaz>) => {
          let prefix = `${name}`.blue;

          if (p.pathIs(anyBarBazRoute.pattern)) {
            console.log(prefix, `${name} matches current location!`.green, `(${p.location})`);

            let result = p.exec<NamedRoute, BarBaz>(anyBarBazRoute.pattern);

            console.log(prefix, `${name} route matched on path ${result.path}`);
            console.log(prefix, 'Received typed bar:', result.params.bar);
            console.log(prefix, 'Received typed baz:', result.params.baz);

            let { data } = result.route;

            console.log(prefix, 'Received typed data attribute (name)', data.name);
          }
          if (p.pathIsNot(anyBarBazRoute.pattern)) {
            console.log(prefix, `${name} does not match current location`.red, `(${p.location})`);
          }
        }

        // -------- Use Cases ----------

        // Context - I have a narrowly matching pattern
        //  - I know the param type and route data type
        //  - I want to know if its currently active, and use the typed data and params
        p.setLocation('/foo/ThisIsBar/ThisIsBaz');
        isTypedRouteActive('FooBarBaz', fooBarBazRoute);
        p.setLocation(soyRoute.pathFn({ flavor: 'vanilla' }));
        isTypedRouteActive('FooBarBaz', fooBarBazRoute);



        // Context - I have a generously matching pattern
        //  - I should continue to match for a variety of patterns
        //  - I want to know what route is currently active
        p.setLocation(fooBarBazRoute.pathFn({ bar: 'Cat', baz: 'Dog' }));
        isRouteActive('FooWild', fooWildRoute.pattern);
        p.setLocation(soyRoute.pathFn({ flavor: 'chocolate' }));
        isRouteActive('FooWild', fooWildRoute.pattern);


        // Context - I made a programming error, and used an unregistered route
        //  - I might waste lots of time debugging my component before I notice the mistake
        let pathToNowhere = '/this/path/has/no/route'
        let prefix = 'RoadToNowhere'.yellow;
        try {
          p.pathIs(pathToNowhere);
          throw new Error('PathMatcher should have thrown')
        } catch (e) {
          console.log(prefix, 'Exception'.red, e);
        }
        // I can check that my route was registered with hasRoute and assertRoute
        try {
          p.assertRoute(pathToNowhere);
          throw new Error('PathMatcher should have thrown')
        } catch (e) {
          console.log(prefix, 'Exception'.red, e);
        }

        if (!p.hasRoute(pathToNowhere)) {
          console.log(prefix, 'Oh, it wasnt plugged in...');
        } else {
          throw new Error(`PathMatcher should have returned false for hasRoute(${pathToNowhere})`)
        }


        // Context - I react to events using the current route
        //  - I may do trigger sort of side-effect, such as logging
        //  - I'm not particularly interested in what the routes do, just what they are
        const sideHustle = () => {
          let prefix = 'SideHustle'.rainbow;
          console.log(prefix, 'Finding all matching routes'.cyan);

          let allMatching = p.allMatches();

          allMatching.forEach(m => {
            let { pattern, score } = m.route;
            console.log(prefix, `→ Route ${pattern.yellow} matches; score: ${`${score}`.bgMagenta}`);
          })
        }
        p.setLocation(fooWildRoute.pathFn({ 0: 'what/does/this/do\\?' }))
        sideHustle();
      });
    });
  });
});