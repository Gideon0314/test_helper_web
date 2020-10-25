import request from '@/utils/request'

export function projectList(query) {
  return request({
    url: '/project/list',
    method: 'get',
    params: query
  })
}

export function createProject(data) {
  return request({
    url: '/project/add',
    method: 'post',
    data
  })
}

export function updateProject(data) {
  return request({
    url: '/project/update',
    method: 'post',
    data
  })
}

export function deleteProject(data) {
  return request({
    url: '/project/delete',
    method: 'delete',
    data
  })
}

export function getProjectApiDocs(data) {
  return request({
    url: '/project/get_api_docs',
    method: 'post',
    data,
    timeout: 10000000
  })
}
