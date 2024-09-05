let ar = [
    {
        link: 'djsjs',
        cName: 'fop'
    },
    {
        link: 'ppp',
        cName: 'foc'
    }
]

for(let it of ar){
    console.log(Object.keys(it))
    console.log(it['link'], it['cName'])
}