import { useNavigate, useSearchParams } from "react-router-dom";
import ListingTools from "../../shared/components/listing-tools/ListingTools";
import BasePageLayout from "../../shared/layout/BasePageLayout";
import { useEffect, useMemo, useState } from "react";
import { IListUser, UsersServices } from "../../shared/services/users/UsersServices";
import { useDebounce } from "../../shared/hooks/UseDebounce";

import {  Icon, 
          IconButton, 
          Pagination, 
          Paper, 
          Skeleton, 
          Table, 
          TableBody, 
          TableCell, 
          TableContainer, 
          TableFooter, 
          TableHead, 
          TableRow, 
          Typography, 
          useTheme 
        } from "@mui/material";

import { Environment } from "../../shared/environment";

export default function ListOfUsers() {

    const [ searchParams , setSearchParams ] = useSearchParams()
    const { debounce } = useDebounce()

    const [ rows , setRows ] = useState<IListUser[]>([])
    const [ totalCount , setTotalCount ] = useState(0)
    const [ isLoading , setIsLoading ] = useState(false)

    const navigate = useNavigate()

    const theme = useTheme()
    

    const search = useMemo(() => {
        return searchParams.get("buscar") || ""
    },[searchParams])

    const pages = useMemo(() => {
        return Number(searchParams.get("pagina") || "0")
    },[searchParams])

    useEffect(() => {
      setIsLoading(true)
        debounce(() => {
        UsersServices.getAll( pages , search)
        .then((result) => {
          if(result instanceof Error){
            alert(result.message)
            return
          }
          setTimeout(() => {
            setIsLoading(false)
          },2000)
          console.log(result)
          setRows(result.data)
          setTotalCount(result.totalCount)
        })
      })
    },[debounce , search , pages])

    const handleDelete = (id: number) => {
      if(confirm('Realmente deseja apagar!')){
        UsersServices.deleteById(id)
          .then(result => {
            if(result instanceof Error){
              alert(result.message)
            }
            setRows(oldRows =>{
              return [...oldRows.filter(oldRow => oldRow.id !== id)]
            })
          })
      }
    }
        
  return (
    <BasePageLayout 
        title="Listagem de Pessoas"
        toolbar={<ListingTools  
            showNewButton
            showInputSearch={true}
            textNewButton="nova"
            searchText={search}
            isNewClick={() => navigate("/pessoas/detalhe/nova")}
            changingSearchText={text => 
              setSearchParams({ buscar: text, pages: '1' },
              { replace: true })}
            />}
    >
      <TableContainer 
        component={Paper} 
        variant="outlined" 
        sx={{ m: 1 , width: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow style={{ background: theme.palette.secondary.main }}>
                <TableCell>Ação</TableCell>
                <TableCell>Nome completo</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>

                { rows.map(row => (
                  <TableRow key={row.id}>
                    { isLoading && (
                      <TableCell  colSpan={3}>
                        <Typography 
                          variant="h4" 
                          sx={{ margin: '-4px 0' }}
                        >
                          <Skeleton/>
                        </Typography>
                      </TableCell>
                    )||(
                      <>
                        <TableCell>
                          <IconButton 
                            size="small"  
                            onClick={() => handleDelete(row.id)}
                          >
                            <Icon >delete</Icon>
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => navigate(`/pessoas/detalhe/${row.id}`)}
                            >
                            <Icon>edit</Icon>
                          </IconButton>     
                        </TableCell>
                        <TableCell>{row.nameCompleted}</TableCell>
                        <TableCell>{row.email}</TableCell>
                      </>
                    )}
                  </TableRow>
                )) }
                  {rows.length === 0 
                    && totalCount 
                    && !isLoading 
                    && (
                      <TableRow >
                        <TableCell >
                          <caption 
                            style={{ display: "flex"}}>
                            {Environment.EMPTY_LISTING}
                          </caption>
                        </TableCell>
                      </TableRow>
                  )}
            </TableBody>
            
          </Table>
                {(totalCount > 0 && totalCount > Environment.LINE_LIMIT) && (
                  <TableFooter 
                    sx={{ display: "flex",
                          alignItems: "center", 
                          justifyContent: "center", 
                          padding: "20px"
                          }}
                        >
                    <Pagination 
                      color="secondary"
                      variant="outlined"
                      page={pages}
                      count={Math.ceil(totalCount / Environment.LINE_LIMIT)} 
                      onChange={(_, newPage) => 
                        setSearchParams({ buscar: search , 
                                          pagina: newPage.toString() }, 
                        { replace: true })}
                    />
                  </TableFooter>
                )}  
      </TableContainer>
    </BasePageLayout>
  )
}
