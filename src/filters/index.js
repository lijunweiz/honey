// eslint-disable-next-line no-unused-vars
class VariableStatus {
  constructor(status, desc, type) {
    this.status = status
    this.desc = desc
    this.type = type
  }
}

// export const variableStatusMap = new Map([
//   [0, new VariableStatus(0, '新建', '')],
//   [1, new VariableStatus(1, '编辑中', '')],
//   [2, new VariableStatus(2, '草稿', '')],
//   [3, new VariableStatus(3, '提交审核', '')],
//   [4, new VariableStatus(4, '审核中', '')],
//   [5, new VariableStatus(5, '审核通过', 'success')],
//   [6, new VariableStatus(6, '审核拒绝', '')],
//   [7, new VariableStatus(7, '开始发布', '')],
//   [8, new VariableStatus(8, '发布成功|运行中', 'success')],
//   [9, new VariableStatus(9, '发布失败', '')],
//   [10, new VariableStatus(10, '准备删除', '')],
//   [11, new VariableStatus(11, '删除成功|已下线', '')],
//   [12, new VariableStatus(12, '删除失败', '')]
// ])
export const variableStatusMap = new Map([
  [0, '新建'],
  [1, '编辑中'],
  [2, '草稿'],
  [3, '提交审核'],
  [4, '审核中'],
  [5, '审核通过'],
  [6, '审核拒绝'],
  [7, '开始发布'],
  [8, '发布成功|运行中'],
  [9, '发布失败'],
  [10, '准备删除'],
  [11, '删除成功|已下线'],
  [12, '删除失败']
])

export function dateFormatFilter(value) {
  if (typeof (value) === 'undefined' || value === null) return ''

  const dateTime = new Date(value)
  const year = dateTime.getFullYear()
  const month = (dateTime.getMonth() + 1).toString().padStart(2, '0')
  const day = dateTime.getDate().toString().padStart(2, '0')
  const hour = dateTime.getHours().toString().padStart(2, '0')
  const minutes = dateTime.getMinutes().toString().padStart(2, '0')
  const seconds = dateTime.getSeconds().toString().padStart(2, '0')
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds
}

export function variableStatusFilter(key) {
  const value = variableStatusMap.get(key)
  if (value === undefined) {
    return key
  }
  const tv = value.split('\|')
  return tv.length === 1 ? tv[0] : tv[1]
}
