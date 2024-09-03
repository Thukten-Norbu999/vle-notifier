const datetime = new Date(`September 9, 2024 23:59:00`)
const time = '23:59:00'.split(':').map(el => Number(el))

console.log('debug',datetime.getFullYear(), datetime.getMonth()+1, datetime.getDate(), time)