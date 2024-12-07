import request from '@/utils/request'

export function fetchDataSourceTypes(query) {
  return request({
    url: '/manage/dict/query',
    method: 'get',
    params: query
  })
}

export function fetchDataSourceNames(query) {
  return request({
    url: '/manage/datasource/names',
    method: 'get',
    params: query
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

export function publishDataSource(data) {
  return request({
    url: '/manage/datasource/publish',
    method: 'post',
    data
  })
}
