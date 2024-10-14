import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Путь к сгенерированному index.html
const indexPath = resolve('dist', 'index.html')

// Чтение файла index.html
let indexHtml = readFileSync(indexPath, 'utf-8')

// Замена путей к активам
indexHtml = indexHtml.replace(/ src="\/assets\//g, ' src="./assets/').replace(/ href="\/assets\//g, ' href="./assets/')

// Запись обратно в index.html
writeFileSync(indexPath, indexHtml)

console.log('Пути в index.html исправлены')
