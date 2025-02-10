import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmployeeService } from 'src/employees/Services/employee.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { keyStore } from '../Entitys/keyStore.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenUsed } from '../Entitys/refreshTokenUsed';
@Injectable()
export class AuthService {
  constructor(
    private employeeService: EmployeeService,
    @InjectRepository(keyStore)
    private keyStoreRepository: Repository<keyStore>,
    private JwtService: JwtService,
    @InjectRepository(RefreshTokenUsed)
    private refreshRepository: Repository<RefreshTokenUsed>,
  ) {}
  async deleteRefreshTokenKey(keyStore) {
    await this.keyStoreRepository.remove(keyStore);
  }
  async createTokenPair(payload, access_private_key, refresh_private_key) {
    try {
      const accessToken = this.JwtService.sign(payload, {
        secret: access_private_key,
        expiresIn: '1h',
      });
      const refreshToken = this.JwtService.sign(payload, {
        secret: refresh_private_key,
        expiresIn: '24h',
      });
      return { accessToken, refreshToken };
    } catch (error) {
      console.log(error);
    }
  }
  async signUp({ full_name, email, password }) {
    console.log(password);
    // check email in dbs
    if (await this.employeeService.findEmployeeByEmail(email)) {
      throw new HttpException(
        'Error: employee registered',
        HttpStatus.BAD_REQUEST,
      );
    }
    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(passwordHash);
    // create employee
    const newEmployee = await this.employeeService.newEmployee({
      full_name,
      email,
      passwordHash,
    });
    if (newEmployee) {
      //create private Key
      const access_privateKey = crypto.randomBytes(64).toString('hex');
      const refresh_privateKey = crypto.randomBytes(64).toString('hex');
      // create Tokens
      const tokens = await this.createTokenPair(
        { employee_id: newEmployee.employee_id, email: email },
        access_privateKey,
        refresh_privateKey,
      );
      console.log({ access_privateKey, refresh_privateKey });
      /// save in dbs
      const newKeyStore = new keyStore();
      newKeyStore.employees_id = newEmployee.employee_id;
      newKeyStore.access_private_key = access_privateKey;
      newKeyStore.refresh_private_key = refresh_privateKey;
      newKeyStore.refresh_token = tokens.refreshToken;
      const newKey = await this.keyStoreRepository.save(newKeyStore);
      console.log(newKey);

      return {
        status: 201,
        metadata: {
          employee: {
            employee_id: newEmployee.employee_id,
            employee_email: newEmployee.email,
            employee_full_name: newEmployee.full_name,
          },
          tokens,
        },
      };
    }
    return {
      status: 200,
      metadata: null,
    };
  }
  async login({ email, password }) {
    // check email in dbs
    const foundEmployee = await this.employeeService.findEmployeeByEmail(email);
    if (!foundEmployee) {
      throw new HttpException('Shop not registered', HttpStatus.BAD_GATEWAY);
    }
    //delete
    const keyForDelete = await this.keyStoreRepository.find({
      where: { employees_id: foundEmployee.employee_id },
    });
    keyForDelete.forEach(async (Object) => {
      console.log(Object);

      await this.refreshRepository.delete({
        keystore: { key_store_id: Object.key_store_id },
      });
    });
    await this.keyStoreRepository.delete({
      employees_id: foundEmployee.employee_id,
    });
    // match password
    const match = await bcrypt.compare(password, foundEmployee.password);
    if (!match) {
      throw new HttpException('Authentication error', HttpStatus.UNAUTHORIZED);
    }
    // create at vs rt and save
    const access_private_key = crypto.randomBytes(64).toString('hex');
    const refresh_private_key = crypto.randomBytes(64).toString('hex');
    //generate tokens
    const tokens = await this.createTokenPair(
      { employee_id: foundEmployee.employee_id, email: foundEmployee.email },
      access_private_key,
      refresh_private_key,
    );

    // get data and return login
    const keyStoreLogin = new keyStore();
    keyStoreLogin.access_private_key = access_private_key;
    keyStoreLogin.refresh_private_key = refresh_private_key;
    keyStoreLogin.employees_id = foundEmployee.employee_id;
    keyStoreLogin.refresh_token = tokens.refreshToken;
    await this.keyStoreRepository.save(keyStoreLogin);
    return {
      status: 201,
      metadata: {
        employee: {
          employee_id: foundEmployee.employee_id,
          employee_email: foundEmployee.email,
          employee_full_name: foundEmployee.full_name,
        },
        tokens,
      },
    };
  }
  async findKeyStoreByEmployeeId(employee_id) {
    return this.keyStoreRepository.findOneBy({ employees_id: employee_id });
  }
  async logout(keyStore) {
    console.log(keyStore);

    const keyForDelete = await this.keyStoreRepository.find({
      where: { employees_id: keyStore.employee_id },
    });
    keyForDelete.forEach(async (Object) => {
      console.log(Object);

      await this.refreshRepository.delete({
        keystore: { key_store_id: Object.key_store_id },
      });
    });

    return await this.keyStoreRepository.delete({
      employees_id: keyStore.employees_id,
    });
  }
  async refreshToken(keyStore, employee, refreshToken) {
    console.log(keyStore, employee, refreshToken);
    const key_store = await this.keyStoreRepository.findOne({
      where: { key_store_id: keyStore.key_store_id },
      relations: ['refresh_token_used'],
    });
    let access = true;
    key_store.refresh_token_used.forEach((object) => {
      object.refreshToken === refreshToken ? (access = false) : access;
    });
    if (!access) {
      await this.refreshRepository.delete({
        keystore: { key_store_id: key_store.key_store_id },
      });
      await this.keyStoreRepository.remove(key_store);
      throw new HttpException(
        'relogin something wrong 1',
        HttpStatus.FORBIDDEN,
      );
    }

    if (keyStore.refresh_token !== refreshToken) {
      throw new HttpException(
        'relogin something wrong 2',
        HttpStatus.FORBIDDEN,
      );
    }
    const foundEmployee = await this.employeeService.findEmployeeByEmail(
      employee.email,
    );
    if (!foundEmployee) {
      throw new HttpException('can not find employee', HttpStatus.FORBIDDEN);
    }
    const tokens = await this.createTokenPair(
      { employee_id: foundEmployee.employee_id, email: foundEmployee.email },
      keyStore.access_private_key,
      keyStore.refresh_private_key,
    );
    key_store.refresh_token = tokens.refreshToken;
    const refreshTokenUsed = new RefreshTokenUsed();
    refreshTokenUsed.refreshToken = refreshToken;
    await this.keyStoreRepository.manager.save(refreshTokenUsed);
    key_store.refresh_token_used.push(refreshTokenUsed);
    await this.keyStoreRepository.manager.save(key_store);
    return {
      employee: {
        employee_id: foundEmployee.employee_id,
        employee_email: foundEmployee.email,
      },
      tokens,
    };
  }
}
