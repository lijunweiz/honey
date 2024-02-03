import request from '@/utils/request'

export function fetchDataSourceTypes() {
  return request({
    url: '/manage/datasource/types',
    method: 'get'
  })
}

export function fetchList(query) {
  return request({
    url: '/manage/datasource/list',
    method: 'get',
    params: query
  })
}

export function createDataSource(data) {
  return request({
    url: '/manage/datasource/add',
    method: 'post',
    data: data
  })
}

export function updateDataSource(data) {
  return request({
    url: '/manage/datasource/update',
    method: 'post',
    data
  })
}
