import { PrismaClient } from "@prisma/client";


let prisma = new PrismaClient({
  errorFormat: 'minimal',

  log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  
})
//let prisma = new PrismaClient({log: ['query', 'info', 'warn', 'error']})

if (process.env.QUERY_PERFORMANCE_LOG)
  prisma.$use(async (params:any, next:any) => {
    const before = Date.now()

    const result = await next(params)

    const after = Date.now()

    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)

    return result
  })

    // prisma.$on<any>('query', (e:any) => {
    //   console.log('Query: ' + e.query)
    //   console.log('Params: ' + e.params)
    //   console.log('Duration: ' + e.duration + 'ms')
    // })
  
  

  //@ts-ignore
  //console.log(JSON.stringify(prisma._dmmf, getCircularReplacer()))

export default prisma;