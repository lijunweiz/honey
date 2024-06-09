import request from '@/utils/request'

export function fetchModelData(query) {
  return request({
    url: '/manage/model/data',
    method: 'get',
    params: query
  })
}

export function createTreeNode(data) {
  return request({
    url: '/manage/model/create/tree/item',
    method: 'post',
    data: data
  })
}
