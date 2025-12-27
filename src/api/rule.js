import request from '@/utils/request'

export function fetchRuleOperator(query) {
  return request({
    url: '/manage/rule/operator',
    method: 'get',
    params: query
  })
}

export function fetchRuleList(query) {
  return request({
    url: '/manage/rule/list',
    method: 'get',
    params: query
  })
}

export function createRuleSet(data) {
  return request({
    url: '/manage/rule/create',
    method: 'post',
    data: data
  })
}

export function updateRuleSet(data) {
  return request({
    url: '/manage/rule/update',
    method: 'post',
    data: data
  })
}
