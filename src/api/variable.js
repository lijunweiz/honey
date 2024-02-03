import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/manage/variable/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/manage/variable/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/manage/variable/pv',
    method: 'get',
    params: { pv }
  })
}

export function createVariable(data) {
  return request({
    url: '/manage/variable/add',
    method: 'post',
    data
  })
}

export function updateVariable(data) {
  return request({
    url: '/manage/variable/update',
    method: 'post',
    data
  })
}
