      const repl = require('repl') 
      const util = require('util') 
      const vm = require('vm') 
      const fetch = require('node-fetch') 
      const { Headers } = fetch

//initializes null cookie ahead of user ID sessions logs coming in
//
      let cookie = null

//enables credential logging via cookies and parsed reading of input in JSON
//


      const query = (path, ops) => {
          return fetch(`http://localhost:1337/users/${path}`, {
              method: ops.method,
              body: ops.body,
              credentials: 'include',
              body: JSON.stringify(ops.body),
              headers: new Headers({
                  ...(ops.headers || {}),
                  cookie,
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
              }),
          }).then(async (r) => {
              cookie = r.headers.get('set-cookie') || cookie
              return {
                  data: await r.json(),
                  status: r.status,
              }
          }).catch(error => error)
      }
//users can sign up
//

      const signup = (username, password) => query('/signup', {
          method: 'POST',
          body: { username, password },
      })

//users can log in 
//
      const login = (username, password) => query('/login', {
          method: 'POST',
          body: { username, password },
      })


//users can log out
//

      const logout = () => query('/logout', {
          method: 'POST',
      })

//users can retrieve profile
//


      const getProfile = () => query('/profile', {
          method: 'GET',
      })

//users can change passwords


      const changePassword = (password) => query('/changepass', {
          method: 'PUT',
          body: { password },
      })

//users can request profile deletion
//


      const deleteProfile = () => query('/delete', {
          method: 'DELETE',
      })

//virtual REPL server starts and waits until promise is fulfilled then prints output from requests
//
      const replServer = repl.start({
          prompt: '> ',
          ignoreUndefined: true,
          async eval(cmd, context, filename, callback) {
              const script = new vm.Script(cmd)
              const is_raw = process.stdin.isRaw
              process.stdin.setRawMode(false)
              try {
                  const res = await Promise.resolve(
                      script.runInContext(context, {
                          displayErrors: false,
                          breakOnSigint: true,
                      })
                  )
                  callback(null, res)
              } catch (error) {
                  callback(error)
              } finally {
                  process.stdin.setRawMode(is_raw)
              }
          },
          writer(output) {
              return util.inspect(output, {
                  breakLength: process.stdout.columns,
                  colors: true,
                  compact: false,
              })
          }
      })

      //Adds definted functions to this REPL's context where it will be exectuted

	replServer.context.api = { 
          signup, 
          login, 
          logout, 
          getProfile, 
          changePassword, 
          deleteProfile, 
      } 

