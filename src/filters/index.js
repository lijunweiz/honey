// eslint-disable-next-line no-unused-vars
class VariableStatus {
  constructor(status, desc, type) {
    this.status = status
    this.desc = desc
    this.type = type
  }
}

export const variableStatusMap = new Map([
  [0, '新建'],
  [1, '编辑'],
  [2, '运行'],
  [3, '停用'],
  [4, '删除']
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

export function dataSourceTypeFilter(value, list) {
  for (const item of list) {
    if (item.itemCode === value) {
      return item.itemValue
    }
  }
  return value
}
