#!/usr/bin/env python
# coding: utf-8

# In[1]:


def fibRec(n):
    if n < 2:
        return n
    else:
        return fibRec(n-1) + fibRec(n-2)
    
print(fibRec(35))


# In[ ]:




