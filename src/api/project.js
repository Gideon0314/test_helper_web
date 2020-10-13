import request from '@/utils/request'

export function ProjectList(query) {
  return request({
    url: '/project/list',
    method: 'get',
    params: query
  })
}
