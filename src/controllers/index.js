'use strict'

import systemController from './systemController'
import favouriteController from './favouriteController'
import commentController from './commentController'
import miscController from './miscController'

export default {
  init: (router) => {
    systemController.init(router)
    favouriteController.init(router)
    commentController.init(router)
    miscController.init(router)

    router.get("/health", (req, res) => {
      res.json({ status: "ok" })
    })

    return
  }
}
