import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/manage/dict/list',
    method: 'get',
    params: query
  })
}

export function createDict(data) {
  return request({
    url: '/manage/dict/create',
    method: 'post',
    data: data
  })
}

export function updateDict(data) {
  return request({
    url: '/manage/dict/modify',
    method: 'post',
    data
  })
}

export function fetchDictStatus() {
  return request({
    url: '/manage/dict/status',
    method: 'get'
  })
}

