import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { default as request, default as supertest } from 'supertest'
import { PermissionsDto } from './dto/permissions.dto'
import { RolesModule } from './test/roles.module'
import { createLoggerModule } from '../../logger'

describe('The RolesController', () => {
  let app: INestApplication
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [RolesModule, createLoggerModule()],
    }).compile()
    jest.setTimeout(20000)

    app = module.createNestApplication()
    await app.init()
  })

  function sendGetRequest(
    permissions: PermissionsDto[],
    path: string,
    queryRefId: string,
    queryRefType: string,
  ): supertest.Test {
    return request(app.getHttpServer())
      .get(path)
      .set('x-permissions', JSON.stringify(permissions))
      .set('x-user-id', '222222')
      .set('x-tenant-id', '111111')
      .set('x-project-id', '333333')
      .set('Content-Type', 'application/json')
      .query({
        ref_id: queryRefId,
        ref_type: queryRefType,
      })
      .send({})
  }

  function sendGetRequestWithoutProject(
    permissions: PermissionsDto[],
    path: string,
    queryRefId: string,
    queryRefType: string,
  ): supertest.Test {
    return request(app.getHttpServer())
      .get(path)
      .set('x-permissions', JSON.stringify(permissions))
      .set('x-user-id', '222222')
      .set('x-tenant-id', '111111')
      .set('Content-Type', 'application/json')
      .query({
        ref_id: queryRefId,
        ref_type: queryRefType,
      })
      .send({})
  }

  describe('test permissions', () => {
    it('has just one permissions. send valid one', async () => {
      const request = sendGetRequest(
        [{ projectId: '333333', permissions: ['one'] }],
        '/az/test_one',
        '222222',
        'employee',
      )
      await request.expect(200)
    })
    it('has just one permissions. send valid one and another invalid', async () => {
      const request = sendGetRequest(
        [{ projectId: '333333', permissions: ['one', 'three'] }],
        '/az/test_one',
        '222222',
        'employee',
      )
      await request.expect(200)
    })
    it('has just one permissions. send invalid one', async () => {
      const request = sendGetRequest(
        [{ projectId: '333333', permissions: ['two'] }],
        '/az/test_one',
        '222222',
        'employee',
      )
      await request.expect(403)
    })
    it('has two permissions. send valid one', async () => {
      const request = sendGetRequest(
        [{ projectId: '333333', permissions: ['one'] }],
        '/az/test_two',
        '222222',
        'employee',
      )
      await request.expect(200)
    })
    it('has two permissions. send valid other', async () => {
      const request = sendGetRequest(
        [{ projectId: '333333', permissions: ['two'] }],
        '/az/test_two',
        '222222',
        'employee',
      )
      await request.expect(200)
    })
    it('has two permissions. send valid one and other invalid', async () => {
      const request = sendGetRequest(
        [{ projectId: '333333', permissions: ['two', 'three'] }],
        '/az/test_two',
        '222222',
        'employee',
      )
      await request.expect(200)
    })
    it('has two permissions. send invalid one', async () => {
      const request = sendGetRequest(
        [{ projectId: '333333', permissions: ['three'] }],
        '/az/test_two',
        '222222',
        'employee',
      )
      await request.expect(403)
    })
    it('has two permissions. missing projectId header', async () => {
      const request = sendGetRequestWithoutProject(
        [{ projectId: '333333', permissions: ['three'] }],
        '/az/test_two',
        '222222',
        'employee',
      )
      await request.expect(403)
    })
    it('has no permissions. send any ', async () => {
      const request = sendGetRequest(
        [{ projectId: '333333', permissions: ['one'] }],
        '/az/test_two',
        '222222',
        'employee',
      )
      await request.expect(200)
    })
    it('has global permissions. send valid one', async () => {
      const request = sendGetRequest(
        [{ projectId: 'GLOBAL', permissions: ['three'] }],
        '/az/test_global',
        '222222',
        'employee',
      )
      await request.expect(200)
    })
    it('has global permissions. send invalid one-1', async () => {
      const request = sendGetRequest(
        [{ projectId: 'GLOBAL', permissions: ['one'] }],
        '/az/test_global',
        '222222',
        'employee',
      )
      await request.expect(403)
    })
    it('has global. send valid one but in project', async () => {
      const request = sendGetRequest(
        [{ projectId: '333333', permissions: ['one'] }],
        '/az/test_global',
        '222222',
        'employee',
      )
      await request.expect(403)
    })
    it('has global permissions. send valid one', async () => {
      const request = sendGetRequestWithoutProject(
        [{ projectId: 'GLOBAL', permissions: ['three'] }],
        '/az/test_global',
        '222222',
        'employee',
      )
      await request.expect(200)
    })
    it('has global permissions. send invalid one-2', async () => {
      const request = sendGetRequestWithoutProject(
        [{ projectId: 'GLOBAL', permissions: ['one'] }],
        '/az/test_global',
        '222222',
        'employee',
      )
      await request.expect(403)
    })
    it('has global. send valid one but in project', async () => {
      const request = sendGetRequestWithoutProject(
        [{ projectId: '333333', permissions: ['one'] }],
        '/az/test_global',
        '222222',
        'employee',
      )
      await request.expect(403)
    })
    it('has project permission. without project id in header', async () => {
      const request = sendGetRequestWithoutProject(
        [{ projectId: '333333', permissions: ['one'] }],
        '/az/test_one',
        '222222',
        'employee',
      )
      await request.expect(403)
    })
  })
})
