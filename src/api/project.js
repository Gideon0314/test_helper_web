import request from '@/utils/request'

export function projectList(query) {
  return request({
    url: '/project/list',
    method: 'get',
    params: query
  })
}
