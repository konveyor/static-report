package com.example.apps2;


public class File2<T> {
    private T element;

    public GenericClass(T element) {
        this.element = element;
    }

    public T get() {
        return element;
    }
}