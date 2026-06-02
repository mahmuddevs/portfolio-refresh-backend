import multer from 'multer'

import fs from 'fs'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/resumes'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now()
    cb(null, uniquePrefix + file.originalname)
  }
})

export const upload = multer({ storage: storage })