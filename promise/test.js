// promise的链式调用
/**
 * 1、如果then方法中(成功或失败)返回的不是一个promise，会将这个值传递给外层下一次的then的结果中
 * 2、如果执行then中的方法出错了 抛出异常 走到下一个then的失败
 * 3、如果返回的是一个promise 会用这个promise的结果作为下一次then的成功或失败
 * 
 * 
 * 出错会失败  返回的promise出错也会失败
 * 
 * catch就是then的别名 没有成功只有失败  then(null,(err)=>{})
 * 
 * then方法链式调用是因为每次都返回了一个promise
 */