/*
  语言文件说明
*/
const info = {
  // 语言名称
  name: '繁体中文',
  // 语言代码
  code: 'zh-TW',
  // 语言排序
  sort: 2
}

// 自动加载多语言字典文件 下面函数第一个参数为字典文件所在目录名称
const dictsFiles = require.context('./zh_HK', false, /.ts$/)
const dicts = dictsFiles.keys().reduce((dicts: {[index: string]: any}, path) => {
  const dict = dictsFiles(path).default
  dicts[dict.section] = dict.dicts
  return dicts
}, {})



const zh_HK = {
  info,
  dicts,
};
export default zh_HK
